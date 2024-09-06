import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ClientError } from "../errors/client-error";
import { libDayjs } from "../lib/dayjs";
import { libPrisma } from "../lib/prisma";

export async function getActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;

      const trip = await libPrisma.trip.findUnique({
        where: { id: tripId },
        include: {
          activities: {
            orderBy: {
              occurs_at: "asc",
            },
          },
        },
      });

      if (!trip) {
        throw new ClientError({ message: "Trip not found", code: 404 });
      }

      const diasEntreAsDatas = libDayjs(trip.ends_at).diff(
        trip.starts_at,
        "days"
      );
      const diasTotais = diasEntreAsDatas + 1;
      const activities = Array.from({ length: diasTotais });
      const activitiesFormatted = activities.map((_, idx) => {
        const currentDate = libDayjs(trip.starts_at).add(idx, "days");
        return {
          date: currentDate.toDate(),
          activities: trip.activities.filter((activity) =>
            libDayjs(activity.occurs_at).isSame(currentDate, "date")
          ),
        };
      });

      return reply.status(200).send(activitiesFormatted);
    }
  );
}
