import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

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
        throw new Error("Start date cannot be after end date");
      }

      if (libDayjs(starts_at).isBefore(libDayjs())) {
        throw new Error("Start date cannot be in the past");
      }

      const trip = await libPrisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        return reply.status(404).send({ error: "Trip not found" });
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
