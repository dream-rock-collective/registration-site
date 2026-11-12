import {
  escapeHtml,
  validateInitialPageContent,
  type DonationSection,
  type SiteSection,
} from "./content.ts";
import { renderInitialPage, sectionDivider } from "./render-initial-page.ts";
import { pageTemplates } from "./page-templates.ts";

export type EditablePage = "main" | "subscriptions" | "donations" | "success";
export function renderPage(
  value: unknown,
  page: EditablePage = "main",
): string {
  const content = validateInitialPageContent(value);
  if (page === "main") return renderInitialPage(content);
  const fields = content[page];
  const sectionHtml = (section: SiteSection | DonationSection): string => {
    if (section.type === "divider") return sectionDivider;
    const heading = donationHeading(section);
    return `<article><h2>${heading}</h2>${section.body}${section.image ? `<img src="${escapeHtml(section.image.src)}" alt="${escapeHtml(section.image.alt)}">` : ""}</article>`;
  };
  const donationHeading = (section: { title: string; url?: string }) => {
    const title = escapeHtml(section.title);
    return section.url
      ? `<a href="${escapeHtml(section.url)}" target="_blank" rel="noopener noreferrer">${title}</a>`
      : title;
  };
  const replacements: Record<string, string> = {
    title: escapeHtml(fields.title),
    sections: (fields.sections ?? []).map(sectionHtml).join("\n"),
  };
  if (page === "subscriptions") {
    replacements["body"] = content.subscriptions.body;
    for (const [plan, label] of Object.entries(
      content.subscriptions.planLabels,
    ))
      replacements[plan] = escapeHtml(label);
  }
  if (page === "donations") {
    replacements["body"] = content.donations.body;
    replacements["columns"] = content.donations.sections
      .filter((section) => section.key !== undefined)
      .map(
        (section) =>
          `<article class="allocation-column" data-organization="${escapeHtml(section.key)}"><div class="allocation-stack"><div class="allocation-slots" aria-hidden="true"></div><button class="allocation-add" type="button"><span aria-hidden="true">+</span><span class="sr-only">Add 20% to ${escapeHtml(section.title)}</span></button><div class="allocation-filled-slots" aria-hidden="true"></div></div><h2>${donationHeading(section)}</h2></article>`,
      )
      .join("\n");
  }
  return pageTemplates[page].replace(
    /\{\{(title|body|sections|columns|once|monthly|yearly)\}\}/g,
    (_, key: string) => replacements[key] ?? "",
  );
}
