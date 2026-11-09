export const serviceIcons: Record<string, string> = {
  "edu-english": "chat",
  "edu-arabic": "individuals",
  "edu-other-lang": "connect",
  "edu-exam-prep": "certified-document",
  "acc-small-biz": "business",
  "acc-bookkeeping": "settings",
  "acc-statements": "financial-investment",
  "acc-vat-zakat": "insurance",
};

export function coverFor(categoryId: string) {
  return categoryId === "accounting" ? "/opportunities/accounting.svg" : "/opportunities/education.svg";
}
