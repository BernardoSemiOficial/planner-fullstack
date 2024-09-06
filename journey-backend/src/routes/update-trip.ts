import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ClientError } from "../errors/client-error";
import { libDayjs } from "../lib/dayjs";
import { libPrisma } from "../lib/prisma";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { starts_at, ends_at, destination } = request.body;

      if (libDayjs(starts_at).isAfter(libDayjs(ends_at))) {
        throw new ClientError({
          message: "Start date cannot be after end date",
          code: 400,
        });
      }

      if (libDayjs(starts_at).isBefore(libDayjs())) {
        throw new ClientError({
          message: "Start date cannot be in the past",
          code: 400,
        });
      }

      const trip = await libPrisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError({ message: "Trip not found", code: 404 });
      }

      const tripUpdated = await libPrisma.trip.update({
        where: { id: tripId },
        data: {
          starts_at,
          ends_at,
          destination,
        },
      });

      return reply.status(201).send(tripUpdated);
    }
  );
}
