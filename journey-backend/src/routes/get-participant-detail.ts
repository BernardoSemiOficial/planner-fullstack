import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ClientError } from "../errors/client-error";
import { libPrisma } from "../lib/prisma";

export async function getParticipantDetail(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participantId",
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params;

      const participant = await libPrisma.participant.findUnique({
        where: { id: participantId },
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        },
      });

      if (!participant) {
        throw new ClientError({ message: "Participant not found", code: 404 });
      }

      return reply.status(200).send(participant);
    }
  );
}
