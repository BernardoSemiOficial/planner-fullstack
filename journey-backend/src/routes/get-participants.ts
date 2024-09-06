import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { libPrisma } from "../lib/prisma";

export async function getParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/participants",
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
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              is_confirmed: true,
            },
          },
        },
      });

      if (!trip) {
        return reply.status(404).send({ error: "Trip not found" });
      }

      return reply.status(200).send(trip.participants);
    }
  );
}
