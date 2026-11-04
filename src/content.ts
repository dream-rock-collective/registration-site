import pageDefaults from "./page-defaults.json" with { type: "json" };
export type ContentSection = {
  title: string;
  body: string;
  image?: { src: string; alt: string };
};
export type CharitySection = ContentSection & { key: string; url: string };
export type AdditionalPages = {
  subscriptions: {
    title: string;
    body: string;
    sections: ContentSection[];
    planLabels: Record<"once" | "monthly" | "yearly", string>;
  };
  donations: { title: string; body: string; sections: CharitySection[] };
  success: { title: string };
};
export type InitialPageContent = AdditionalPages & {
  join: {
    title: string;
    subtitle: string;
    addressSubtitle: string;
    birthdaySubtitle: string;
    offlineMessage: string;
    submitLabel: string;
    fields: Record<
      "name" | "email" | "address" | "birthday",
      { label: string; placeholder: string }
    >;
  };
  member: {
    overlayHeading: string;
    overlayPlan: string;
    helpBody: string;
    newRegistration: string;
  };
  messages: {
    required: string;
    submitting: string;
    saveFailed: string;
    paymentFailed: string;
    networkFailed: string;
  };
  sections: ContentSection[];
  footer: { text: string };
};

export const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] ?? character,
  );

export function validateImagePath(value: string): boolean {
  return (
    /^\/(?!\/)[A-Za-z0-9_./ -]+\.(png|jpe?g|gif|webp|avif|svg)$/i.test(value) &&
    !value.split("/").some((part) => part === ".." || part === ".")
  );
}

export function validateRichText(html: string): void {
  // Accept a deliberately small HTML grammar; reject everything outside it instead of repairing markup.
  const stack: string[] = [];
  let cursor = 0;
  const inline = new Set(["strong", "em", "a", "br"]);
  while (cursor < html.length) {
    if (html[cursor] !== "<") {
      cursor += 1;
      continue;
    }
    const end = html.indexOf(">", cursor);
    if (end === -1) throw new Error("Unclosed HTML tag");
    const token = html.slice(cursor + 1, end);
    const closing = token.startsWith("/");
    const simple = closing ? token.slice(1) : token;
    let tag = simple;
    if (!closing && simple.startsWith("a ")) {
      const attribute = /^a href="([^"<>]*)"$/.exec(simple);
      if (!attribute?.[1])
        throw new Error("Links must contain only a quoted href");
      const href = attribute[1].replaceAll("&amp;", "&");
      if (/[\u0000-\u0020\u007f\\]/.test(href) || /&(?:#|[a-z]+;)/i.test(href))
        throw new Error("Invalid link");
      if (!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href))
        throw new Error("Unsupported link destination");
      tag = "a";
    }
    if (!["p", "ul", "ol", "li", "strong", "em", "a", "br"].includes(tag))
      throw new Error(`Unsupported HTML tag: ${tag}`);
    if (closing) {
      if (stack.pop() !== tag) throw new Error("HTML tags must be balanced");
    } else {
      const parent = stack.at(-1);
      if (tag === "li" && parent !== "ul" && parent !== "ol")
        throw new Error("List items need a list");
      if ((parent === "ul" || parent === "ol") && tag !== "li")
        throw new Error("Lists contain list items only");
      if (parent && inline.has(parent) && !inline.has(tag))
        throw new Error("Invalid inline nesting");
      if (parent === "p" && !inline.has(tag))
        throw new Error("Paragraphs contain inline content only");
      if (tag === "a" && stack.includes("a"))
        throw new Error("Nested links are not supported");
      if (tag !== "br") stack.push(tag);
    }
    cursor = end + 1;
  }
  if (stack.length) throw new Error("HTML tags must be balanced");
}

function object(
  value: unknown,
  keys: string[],
  path: string,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${path} must be an object`);
  const result = value as Record<string, unknown>;
  if (
    Object.keys(result).some((key) => !keys.includes(key)) ||
    keys.some((key) => !(key in result))
  )
    throw new Error(`Unexpected or missing fields in ${path}`);
  return result;
}
function strings(value: unknown, keys: string[], path: string): void {
  const result = object(value, keys, path);
  for (const key of keys) {
    if (typeof result[key] !== "string" || result[key].length > 50000)
      throw new Error(`${path}.${key} must be text (maximum 50000 characters)`);
  }
}
export function validateInitialPageContent(value: unknown): InitialPageContent {
  const root = object(
    value && typeof value === "object" && !Array.isArray(value)
      ? { ...structuredClone(pageDefaults), ...value }
      : value,
    [
      "join",
      "member",
      "messages",
      "sections",
      "footer",
      "subscriptions",
      "donations",
      "success",
    ],
    "content",
  );
  const joinKeys = [
    "title",
    "subtitle",
    "addressSubtitle",
    "birthdaySubtitle",
    "offlineMessage",
    "submitLabel",
  ];
  const join = object(root["join"], [...joinKeys, "fields"], "join");
  for (const key of joinKeys)
    if (typeof join[key] !== "string" || join[key].length > 50000)
      throw new Error(`join.${key} must be text`);
  const fields = object(
    join["fields"],
    ["name", "email", "address", "birthday"],
    "join.fields",
  );
  for (const key of Object.keys(fields))
    strings(fields[key], ["label", "placeholder"], `join.fields.${key}`);
  strings(
    root["member"],
    ["overlayHeading", "overlayPlan", "helpBody", "newRegistration"],
    "member",
  );
  strings(
    root["messages"],
    ["required", "submitting", "saveFailed", "paymentFailed", "networkFailed"],
    "messages",
  );
  strings(root["footer"], ["text"], "footer");
  validateSections(root["sections"]);
  for (const page of ["subscriptions", "donations"] as const) {
    const candidate = root[page];
    const fields = object(
      page === "subscriptions" &&
        candidate &&
        typeof candidate === "object" &&
        !Array.isArray(candidate)
        ? {
            planLabels: structuredClone(pageDefaults.subscriptions.planLabels),
            ...candidate,
          }
        : candidate,
      [
        "title",
        "body",
        "sections",
        ...(page === "subscriptions" ? ["planLabels"] : []),
      ],
      page,
    );
    root[page] = fields;
    if (page === "subscriptions")
      strings(
        fields["planLabels"],
        ["once", "monthly", "yearly"],
        "subscriptions.planLabels",
      );
    strings(
      { title: fields["title"], body: fields["body"] },
      ["title", "body"],
      page,
    );
    validateRichText(fields["body"] as string);
    validateSections(fields["sections"], page === "donations");
  }
  strings(root["success"], ["title"], "success");
  const content = root as InitialPageContent;
  validateRichText(content.member.helpBody);
  for (const [key, allowed] of [
    ["overlayHeading", ["firstName"]],
    ["overlayPlan", ["plan"]],
  ] as const) {
    const template = content.member[key];
    if (
      [...template.matchAll(/\{([^{}]*)\}/g)].some(
        (match) => !allowed.some((name) => name === match[1]),
      ) ||
      /[{}]/.test(template.replace(/\{[^{}]*\}/g, ""))
    )
      throw new Error(`Unsupported variable in member.${key}`);
  }
  return content;
}
export function formatContentTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(
    /\{([^{}]+)\}/g,
    (_, name: string) => values[name] ?? "",
  );
}

function validateSections(sections: unknown, charities = false): void {
  if (!Array.isArray(sections) || sections.length > 100)
    throw new Error("sections must be an array (maximum 100)");
  if (charities && sections.length === 0)
    throw new Error("At least one charity is required");
  const keysSeen = new Set<string>();
  for (const section of sections) {
    const keys =
      section && typeof section === "object" && "image" in section
        ? ["title", "body", "image"]
        : ["title", "body"];
    if (charities) keys.push("key", "url");
    const item = object(section, keys, "section");
    if (charities) {
      const key = item["key"];
      if (
        typeof key !== "string" ||
        !/^[A-Za-z0-9_-]+$/.test(key) ||
        key.length > 100 ||
        keysSeen.has(key)
      )
        throw new Error(
          "Charity keys must be unique and contain only letters, digits, underscores or hyphens",
        );
      keysSeen.add(key);
      const url = item["url"];
      if (
        typeof url !== "string" ||
        !/^https?:\/\//i.test(url) ||
        /[\s<>"\\]/.test(url)
      )
        throw new Error("Charity URL must be an HTTP or HTTPS URL");
      const destination = new URL(url);
      if (!destination.hostname || destination.username || destination.password)
        throw new Error("Invalid charity URL");
    }
    if (
      typeof item["title"] !== "string" ||
      item["title"].length > 500 ||
      typeof item["body"] !== "string" ||
      item["body"].length > 50000
    )
      throw new Error("Invalid section title or body");
    validateRichText(item["body"]);
    if (item["image"] !== undefined) {
      strings(item["image"], ["src", "alt"], "image");
      const image = item["image"] as { src: string; alt: string };
      if (!validateImagePath(image.src))
        throw new Error(
          "Image must reference an existing root-relative site asset",
        );
    }
  }
}
