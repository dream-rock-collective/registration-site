import { expect, test } from "bun:test";
import content from "../content/initial-page.json";
import { validateInitialPageContent } from "../src/content";
import { renderPage } from "../src/render-page";

test("legacy content receives independent defaults for additional pages", () => {
  const { subscriptions, donations, success, ...legacy } = content;
  const first = validateInitialPageContent(legacy);
  expect(first.donations).toEqual(donations);
  first.donations.sections.reverse();
  expect(validateInitialPageContent(legacy).donations).toEqual(donations);
  expect(first.subscriptions).toEqual(subscriptions);
  expect(first.success).toEqual(success);
});
test("one ordered charity list renders allocation columns and descriptions", () => {
  const copy = validateInitialPageContent(content);
  copy.donations.sections = [
    {
      key: "new-key",
      title: "New & Local",
      url: "https://example.com",
      body: "<p>New charity</p>",
      image: { src: "/leeya-appleby.jpeg", alt: "Local" },
    },
    ...copy.donations.sections.reverse(),
  ];
  const html = renderPage(copy, "donations");
  expect(html).toContain('data-organization="new-key"');
  expect(html.match(/New &amp; Local<\/a>/g)).toHaveLength(2);
  expect(html).toContain("<p>New charity</p><img");
  expect(
    html.indexOf('data-organization="otayMesaDetentionResistance"'),
  ).toBeLessThan(html.indexOf('data-organization="weAllWeGotSd"'));
  expect(html.lastIndexOf("Otay Mesa")).toBeLessThan(
    html.lastIndexOf("We All We Got SD"),
  );
  expect(html).not.toContain("{{");
});
test("donation copy and charities without URLs render with plain headings", () => {
  const copy = validateInitialPageContent(structuredClone(content));
  copy.donations.sections = [
    {
      title: "About donations",
      body: "<p>More information</p>",
      image: { src: "/leeya-appleby.jpeg", alt: "About donations" },
    },
    { key: "local", title: "Local charity", body: "<p>Local work</p>" },
    { key: "other", title: "Other charity", body: "", url: "" },
  ];
  const html = renderPage(copy, "donations");
  expect(html.match(/class="allocation-column"/g)).toHaveLength(2);
  expect(html).toContain("<h2>About donations</h2><p>More information</p><img");
  expect(html.match(/<h2>Local charity<\/h2>/g)).toHaveLength(2);
  expect(html.match(/<h2>Other charity<\/h2>/g)).toHaveLength(2);
  copy.donations.sections = copy.donations.sections.slice(0, 1);
  expect(() => renderPage(copy, "donations")).toThrow("At least one charity");
});

test("additional pages escape headings and support editable section lists", () => {
  const copy = validateInitialPageContent(content);
  copy.subscriptions.sections = [
    { title: "<New>", body: "<p>Only this section</p>" },
  ];
  expect(renderPage(copy, "subscriptions")).toContain("&lt;New&gt;</h2>");
  expect(renderPage(copy, "subscriptions")).toContain('data-plan="monthly"');
  copy.success.title = "<Thanks>";
  expect(renderPage(copy, "success")).toContain("&lt;Thanks&gt;</h1>");
});
test("rejects empty lists, duplicate keys, invalid keys, URLs and rich text", () => {
  for (const mutate of [
    (copy: typeof content) => {
      copy.donations.sections = [];
    },
    (copy: typeof content) => {
      copy.donations.sections[1]!.key = copy.donations.sections[0]!.key;
    },
    (copy: typeof content) => {
      copy.donations.sections[0]!.key = "bad key";
    },
    (copy: typeof content) => {
      copy.donations.sections[0]!.url = "javascript:alert(1)";
    },
    (copy: typeof content) => {
      copy.donations.sections[0]!.url = "https://user:password@example.com";
    },
    (copy: typeof content) => {
      copy.subscriptions.body = "<script>alert(1)</script>";
    },
  ]) {
    const copy = structuredClone(content);
    mutate(copy);
    expect(() => validateInitialPageContent(copy)).toThrow();
  }
});

test("subscription labels are editable plain text while prices and plan IDs stay fixed", () => {
  const copy = validateInitialPageContent(content);
  copy.subscriptions.planLabels = {
    once: "Single <letter>",
    monthly: "Every month",
    yearly: "A full year",
  };
  const html = renderPage(copy, "subscriptions");
  expect(html).toContain(
    "<span>Single &lt;letter&gt;</span><strong>$12</strong",
  );
  expect(html).toContain("<span>Every month</span><strong>$10/mo</strong");
  expect(html).toContain("<span>A full year</span><strong>$110/yr</strong");
  for (const plan of ["once", "monthly", "yearly"])
    expect(html).toContain(`data-plan="${plan}"`);
  const { planLabels, ...legacy } = copy.subscriptions;
  expect(
    validateInitialPageContent({ ...copy, subscriptions: legacy }).subscriptions
      .planLabels,
  ).toEqual(content.subscriptions.planLabels);
  expect(() =>
    validateInitialPageContent({
      ...copy,
      subscriptions: {
        ...copy.subscriptions,
        planLabels: { ...planLabels, monthly: 10 },
      },
    }),
  ).toThrow();
});

test("dividers render as dedicated rules on all pages in section order", () => {
  for (const page of [
    "main",
    "subscriptions",
    "donations",
    "success",
  ] as const) {
    const copy = validateInitialPageContent(structuredClone(content));
    const fields = page === "main" ? copy : copy[page];
    fields.sections = [
      ...(fields.sections ?? []),
      { title: "Before divider", body: "<p>Before</p>" },
      { type: "divider" },
      { title: "After divider", body: "<p>After</p>" },
    ];
    const html = renderPage(copy, page);
    expect(html).toContain('<hr class="section-divider">');
    expect(html.indexOf("Before divider")).toBeLessThan(html.indexOf("<hr"));
    expect(html.indexOf("<hr")).toBeLessThan(html.indexOf("After divider"));
    if (page === "donations")
      expect(html.match(/class="allocation-column"/g)).toHaveLength(
        content.donations.sections.length,
      );
  }
});

test("divider records reject copy, images, charity keys and unknown types", () => {
  for (const section of [
    { type: "divider", title: "Unexpected" },
    { type: "divider", image: { src: "/rock.png", alt: "Unexpected" } },
    { type: "divider", key: "charity" },
    { type: "other" },
  ]) {
    const copy = structuredClone(content);
    expect(() =>
      validateInitialPageContent({ ...copy, sections: [section] }),
    ).toThrow();
  }
});
