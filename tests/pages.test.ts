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
