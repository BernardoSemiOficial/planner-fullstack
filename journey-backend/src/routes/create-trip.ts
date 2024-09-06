import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { env } from "../env";
import { ClientError } from "../errors/client-error";
import { libDayjs } from "../lib/dayjs";
import { EmailTemplates, sendEmail } from "../lib/nodemailer";
import { libPrisma } from "../lib/prisma";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string().min(4),
          owner_email: z.string().email(),
          emails_to_invite: z.array(z.string().email()),
        }),
      },
    },
    async (request, reply) => {
      const {
        starts_at,
        ends_at,
        destination,
        emails_to_invite,
        owner_email,
        owner_name,
      } = request.body;

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

      const ownerParticipant = {
        email: owner_email,
        name: owner_name,
        is_owner: true,
        is_confirmed: true,
      };
      const participantsFormatted = emails_to_invite.map((email) => ({
        email,
      }));

      const trip = await libPrisma.trip.create({
        data: {
          starts_at,
          ends_at,
          destination,
          participants: {
            createMany: {
              data: [ownerParticipant, ...participantsFormatted],
            },
          },
        },
      });

      const confirmLink = trip?.id
        ? `${env.API_BASE_URL}/trips/${trip.id}/confirm`
        : "";
      const startsAt = libDayjs(starts_at).format("LL");
      const endsAt = libDayjs(ends_at).format("LL");

      await sendEmail(
        EmailTemplates.Invite,
        {
          address: "user@gmail.com",
          name: "Joãozinho da Silva",
        },
        {
          destination,
          starts_at: startsAt,
          ends_at: endsAt,
          confirm_link: confirmLink,
        }
      );

      return reply.status(201).send(trip);
    }
  );
}
