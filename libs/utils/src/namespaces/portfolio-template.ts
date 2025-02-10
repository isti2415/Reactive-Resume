export const portfolioTemplatesList = ["template-1", "template-2"] as const;

export type PortfolioTemplate = (typeof portfolioTemplatesList)[number];
