import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { libDayjs } from "../lib/dayjs";
import { libPrisma } from "../lib/prisma";

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(4),
          occurs_at: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { title, occurs_at } = request.body;

      const trip = await libPrisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        return reply.status(404).send({ error: "Trip not found" });
      }

      if (libDayjs(occurs_at).isAfter(libDayjs(trip.ends_at))) {
        return reply
          .status(400)
          .send({ error: "Start date cannot be after trip end date" });
      }

      if (libDayjs(occurs_at).isBefore(trip.starts_at)) {
        return reply
          .status(400)
          .send({ error: "Start date cannot be before trip start date" });
      }

      const activity = await libPrisma.activity.create({
        data: {
          title,
          occurs_at,
          trip_id: tripId,
        },
      });

      return reply.status(201).send(activity);
    }
  );
}
