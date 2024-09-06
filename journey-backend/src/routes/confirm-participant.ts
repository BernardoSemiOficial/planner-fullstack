import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { env } from "../env";
import { ClientError } from "../errors/client-error";
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
        throw new ClientError({ message: "Participant not found", code: 404 });
      }

      if (participant.is_confirmed) {
        return reply.redirect(
          `${env.FRONT_BASE_URL}/trips/${participant.trip_id}`
        );
      }

      await libPrisma.participant.update({
        where: {
          id: participantId,
        },
        data: {
          is_confirmed: true,
        },
      });

      return reply.redirect(
        `${env.FRONT_BASE_URL}/trips/${participant.trip_id}`
      );
    }
  );
}
