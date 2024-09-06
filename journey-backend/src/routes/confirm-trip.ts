import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import dayjs from "dayjs";
import { ClientError } from "../errors/client-error";
import { EmailTemplates, sendEmail } from "../lib/nodemailer";
import { libPrisma } from "../lib/prisma";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/confirm",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const tripId = request.params.tripId;

      const trip = await libPrisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          participants: {
            where: {
              is_owner: false,
            },
          },
        },
      });

      if (!trip) {
        throw new ClientError({ message: "Trip not found", code: 404 });
      }

      if (trip.is_confirmed) {
        throw new ClientError({ message: "Trip already confirmed", code: 400 });
      }

      await libPrisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          is_confirmed: true,
        },
      });

      const startsAt = dayjs(trip.starts_at).format("LL");
      const endsAt = dayjs(trip.ends_at).format("LL");

      await Promise.all([
        ...trip.participants.map(async (participant) => {
          const confirmLink = trip?.id
            ? `http://localhost:3000/participants/${participant.id}/confirm`
            : "";
          await sendEmail(
            EmailTemplates.ConfirmParticipant,
            participant.email,
            {
              destination: trip.destination,
              starts_at: startsAt,
              ends_at: endsAt,
              confirm_link: confirmLink,
            }
          );
        }),
      ]);

      return reply.status(200).send({ tripId });
    }
  );
}
