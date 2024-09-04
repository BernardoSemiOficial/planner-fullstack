import { PrismaClient } from "@prisma/client";

export const libPrisma = new PrismaClient({
  log: ["query"],
});
