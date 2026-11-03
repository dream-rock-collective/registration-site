import "./style.css";
import { validateInitialPageContent } from "./content.ts";
import { renderInitialPage } from "./render-initial-page.ts";
import { previewMessage, previewSettings } from "./preview-messages.ts";

// Preview deliberately has no registration, payment, or member-storage imports.
document.addEventListener("submit", (event) => event.preventDefault(), true);
document.addEventListener(
  "click",
  (event) => {
    if (event.target instanceof Element && event.target.closest("a,button"))
      event.preventDefault();
  },
  true,
);

try {
  if (window.parent === window)
    throw new Error("Open this preview from the admin editor");
  const settings = previewSettings(window.location.search);
  window.addEventListener("message", (event) => {
    const message = previewMessage(event, window.parent, settings);
    if (!message) return;
    try {
      const content = validateInitialPageContent(message.content);
      const template = document.createElement("template");
      template.innerHTML = renderInitialPage(content);
      for (const image of template.content.querySelectorAll<HTMLImageElement>(
        "img[src]",
      )) {
        const source = image.getAttribute("src");
        if (source?.startsWith("/") && !source.startsWith("//"))
          image.src = `${import.meta.env.BASE_URL}${source.slice(1)}`;
      }
      for (const field of template.content.querySelectorAll<
        HTMLInputElement | HTMLButtonElement
      >("input,button"))
        field.disabled = true;
      document.body.replaceChildren(template.content);
      window.parent.postMessage(
        { type: "drc-preview-rendered", token: settings.token },
        settings.parentOrigin,
      );
    } catch (error) {
      window.parent.postMessage(
        {
          type: "drc-preview-rendered",
          token: settings.token,
          error:
            error instanceof Error ? error.message : "Could not render preview",
        },
        settings.parentOrigin,
      );
    }
  });
  window.parent.postMessage(
    { type: "drc-preview-ready", token: settings.token },
    settings.parentOrigin,
  );
} catch (error) {
  document.body.textContent =
    error instanceof Error ? error.message : "Could not initialize preview";
}
