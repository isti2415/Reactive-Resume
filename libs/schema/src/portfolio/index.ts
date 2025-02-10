import { portfolioTemplatesList } from "@reactive-resume/utils";
import { z } from "zod";

import { idSchema } from "../shared";

export const portfolioSchema = z.object({
  resumeID: idSchema,
  template: z.enum(portfolioTemplatesList),
});

export type Portfolio = z.infer<typeof portfolioSchema>;

export const defaultPortfolio: Portfolio = {
  resumeID: "",
  template: "template-1",
};
