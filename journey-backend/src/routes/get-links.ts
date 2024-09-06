import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ClientError } from "../errors/client-error";
import { libPrisma } from "../lib/prisma";

export async function getLinks(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/links",
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
        include: { links: true },
      });

      if (!trip) {
        throw new ClientError({ message: "Trip not found", code: 404 });
      }

      return reply.status(200).send(trip.links);
    }
  );
}
