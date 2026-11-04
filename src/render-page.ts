import {
  escapeHtml,
  validateInitialPageContent,
  type ContentSection,
} from "./content.ts";
import { renderInitialPage } from "./render-initial-page.ts";
import { pageTemplates } from "./page-templates.ts";

export type EditablePage = "main" | "subscriptions" | "donations" | "success";
export function renderPage(
  value: unknown,
  page: EditablePage = "main",
): string {
  const content = validateInitialPageContent(value);
  if (page === "main") return renderInitialPage(content);
  const fields = content[page];
  const sectionHtml = (section: ContentSection, heading: string) =>
    `<article><h2>${heading}</h2>${section.body}${section.image ? `<img src="${escapeHtml(section.image.src)}" alt="${escapeHtml(section.image.alt)}">` : ""}</article>`;
  const link = (section: { title: string; url: string }) =>
    `<a href="${escapeHtml(section.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(section.title)}</a>`;
  const replacements: Record<string, string> = {
    title: escapeHtml(fields.title),
  };
  if (page === "subscriptions") {
    replacements["body"] = content.subscriptions.body;
    replacements["sections"] = content.subscriptions.sections
      .map((section) => sectionHtml(section, escapeHtml(section.title)))
      .join("\n");
  }
  if (page === "donations") {
    replacements["body"] = content.donations.body;
    replacements["sections"] = content.donations.sections
      .map((section) => sectionHtml(section, link(section)))
      .join("\n");
    replacements["columns"] = content.donations.sections
      .map(
        (section) =>
          `<article class="allocation-column" data-organization="${escapeHtml(section.key)}"><div class="allocation-stack"><div class="allocation-slots" aria-hidden="true"></div><button class="allocation-add" type="button"><span aria-hidden="true">+</span><span class="sr-only">Add one dollar to ${escapeHtml(section.title)}</span></button><div class="allocation-filled-slots" aria-hidden="true"></div></div><h2>${link(section)}</h2></article>`,
      )
      .join("\n");
  }
  return pageTemplates[page].replace(
    /\{\{(title|body|sections|columns)\}\}/g,
    (_, key: string) => replacements[key] ?? "",
  );
}
