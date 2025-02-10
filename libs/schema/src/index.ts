import { z } from "zod";

import { basicsSchema, defaultBasics } from "./basics";
import { defaultMetadata, metadataSchema } from "./metadata";
import { defaultPortfolio, portfolioSchema } from "./portfolio";
import { defaultSections, sectionsSchema } from "./sections";

// Schema
export const resumeDataSchema = z.object({
  basics: basicsSchema,
  sections: sectionsSchema,
  metadata: metadataSchema,
});

export const portfolioDataSchema = z.object({
  data: portfolioSchema,
});

// Type
export type ResumeData = z.infer<typeof resumeDataSchema>;
export type PortfolioData = z.infer<typeof portfolioDataSchema>;

// Defaults
export const defaultResumeData: ResumeData = {
  basics: defaultBasics,
  sections: defaultSections,
  metadata: defaultMetadata,
};

export const defaultPortfolioData: PortfolioData = {
  data: defaultPortfolio,
};

export * from "./basics";
export * from "./metadata";
export * from "./portfolio";
export * from "./sample";
export * from "./sections";
export * from "./shared";
