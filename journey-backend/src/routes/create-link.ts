import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { libPrisma } from "../lib/prisma";

export async function createLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/links",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(4),
          url: z.string().url(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { title, url } = request.body;

      const trip = await libPrisma.trip.findUnique({
        where: { id: tripId },
        include: { links: true },
      });

      if (!trip) {
        return reply.status(404).send({ error: "Trip not found" });
      }

      const link = await libPrisma.link.create({
        data: {
          title,
          url,
          trip_id: tripId,
        },
      });

      return reply.status(201).send(link);
    }
  );
}
