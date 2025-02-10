import { defaultPortfolioData, idSchema, portfolioDataSchema } from "@reactive-resume/schema";
import { dateSchema } from "@reactive-resume/utils";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

import { userSchema } from "../user";

export const portfolioSchema = z.object({
  id: idSchema,
  title: z.string(),
  slug: z.string(),
  data: portfolioDataSchema.default(defaultPortfolioData),
  visibility: z.enum(["private", "public"]).default("private"),
  locked: z.boolean().default(false),
  userId: idSchema,
  user: userSchema.optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export class PortfolioDto extends createZodDto(portfolioSchema) {}
