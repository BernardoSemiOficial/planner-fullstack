import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { libPrisma } from "../lib/prisma";

export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/participants/:participantId/confirm",
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const participantId = request.params.participantId;

      const participant = await libPrisma.participant.findUnique({
        where: {
          id: participantId,
        },
      });

      if (!participant) {
        return reply.status(404).send({ message: "Participant not found" });
      }

      if (participant.is_confirmed) {
        return reply
          .status(400)
          .send({ message: "Participant already confirmed" });
      }

      await libPrisma.participant.update({
        where: {
          id: participantId,
        },
        data: {
          is_confirmed: true,
        },
      });

      return reply.status(200).send({ participantId });
    }
  );
}
