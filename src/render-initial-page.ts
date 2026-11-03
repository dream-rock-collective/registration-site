import {
  escapeHtml,
  validateInitialPageContent,
  type ContentSection,
  type InitialPageContent,
} from "./content.ts";

const initialClouds =
  [..."abcdefghijklmnopqrstuvwxyz", "aa"]
    .map((name) => `<img class="cloud cloud-${name}" src="/cloud.png" alt="">`)
    .join("\n") +
  "\n" +
  ["a", "b", "c"]
    .map(
      (name) =>
        `<img class="cloud cloud-cluster-${name}" src="/3-cloud-cluster.png" alt="">`,
    )
    .join("\n");

function renderLogo(className: string): string {
  return `
    <div class="${className}" aria-label="Dream-Rock Collective">
      <img src="/dream-rock.png" alt="Dream-Rock">
      <img src="/collective.png" alt="Collective">
    </div>
  `;
}

function renderFields(join: InitialPageContent["join"]): string {
  const limits = { name: 200, email: 320, address: 500, birthday: 100 };
  return (Object.keys(limits) as (keyof typeof limits)[])
    .map((key) => {
      const field = join.fields[key];
      const type = key === "email" ? "email" : "text";
      const required = key === "name" || key === "email";
      const note =
        key === "address"
          ? join.addressSubtitle
          : key === "birthday"
            ? join.birthdaySubtitle
            : undefined;
      return `
        <label for="${key}">${escapeHtml(field.label)}</label>
        <input
          id="${key}" type="${type}"
          name="${key}" placeholder="${escapeHtml(field.placeholder)}" maxlength="${limits[key]}" ${required ? "required" : ""}
        >
        ${note === undefined ? "" : `<p class="field-note">${escapeHtml(note)}</p>`}
      `;
    })
    .join("\n");
}

function renderSection(section: ContentSection, index: number): string {
  const headingId = `section-${index}-heading`;
  const image = section.image;
  const imageMarkup = image
    ? `<img class="section-image" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}">`
    : "";
  return `
    <section
      class="content-section editable-section${image ? " with-image" : ""}"
      aria-labelledby="${headingId}"
    >
      <div class="copy">
        <h2 id="${headingId}">${escapeHtml(section.title)}</h2>
        ${section.body}
      </div>
      ${imageMarkup}
    </section>
  `;
}

export function renderInitialPage(content: InitialPageContent): string {
  validateInitialPageContent(content);
  const { join, member, sections, footer } = content;
  return `
    <main class="site-shell">
      ${initialClouds}
      <header class="hero">
        <img class="hero-rock" src="/rock.png" alt="">
        ${renderLogo("logo")}
      </header>
      <section class="card-section" aria-labelledby="join-heading">
        <img class="cloud cloud-form-left" src="/cloud.png" alt="">
        <img class="cloud cloud-form-right" src="/cloud.png" alt="">
        <img class="cloud cloud-form" src="/cloud.png" alt="">
        <div class="card-block registration-card">
          <div class="member-overlay" id="member-overlay" hidden>
            <div class="member-overlay-content">
              <h2 id="member-overlay-heading"></h2>
              <span class="subscription-subtext" id="member-overlay-plan"></span>
              ${member.helpBody}
              <button class="allocation-change" id="new-registration" type="button">
                ${escapeHtml(member.newRegistration)}
              </button>
            </div>
          </div>
          <h1 id="join-heading">${escapeHtml(join.title)}</h1>
          <p class="signup-intro">${escapeHtml(join.subtitle)}</p>
          <p class="health-banner is-hidden" role="status" aria-live="polite">
            ${escapeHtml(join.offlineMessage)}
          </p>
          <form class="signup-form" id="signup-form">
            ${renderFields(join)}
            <button type="submit" id="signup-submit" disabled>
              ${escapeHtml(join.submitLabel)} <span aria-hidden="true">→</span>
            </button>
            <p class="form-message" id="form-message" role="alert" aria-live="polite"></p>
          </form>
        </div>
      </section>
      ${sections.map(renderSection).join("\n")}
      <footer>
        <p>${escapeHtml(footer.text)} <span aria-hidden="true">🫶</span></p>
        ${renderLogo("footer-logo")}
      </footer>
    </main>
  `;
}
