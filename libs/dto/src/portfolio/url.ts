import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const portfolioUrlSchema = z.object({ url: z.string().url() });

export class PortfolioUrlDto extends createZodDto(portfolioUrlSchema) {}
