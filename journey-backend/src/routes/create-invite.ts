import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ClientError } from "../errors/client-error";
import { libDayjs } from "../lib/dayjs";
import { EmailTemplates, sendEmail } from "../lib/nodemailer";
import { libPrisma } from "../lib/prisma";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          emails_to_invite: z.array(z.string().email()),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { emails_to_invite } = request.body;

      const trip = await libPrisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError({ message: "Trip not found", code: 404 });
      }

      const participantsFormatted = emails_to_invite.map((email) => ({
        email,
        trip_id: tripId,
      }));

      const participants = await libPrisma.participant.createManyAndReturn({
        data: participantsFormatted,
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        },
      });

      const startsAt = libDayjs(trip.starts_at).format("LL");
      const endsAt = libDayjs(trip.ends_at).format("LL");

      await Promise.all([
        ...participants.map(async (participant) => {
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

      return reply.status(201).send(participants);
    }
  );
}
