import { describe, expect, test } from "bun:test";
import content from "../content/initial-page.json" with { type: "json" };
import config from "../vite.config";
import {
  formatContentTemplate,
  validateInitialPageContent,
  validateRichText,
} from "../src/content";
import { renderInitialPage } from "../src/render-initial-page";

const draft = () => structuredClone(content);
describe("initial page content", () => {
  test("Vite preserves dollar replacement sequences in editable copy", () => {
    const previousFooter = content.footer.text;
    try {
      content.footer.text = "$& $` $'";
      const plugin = config.plugins?.[0] as {
        transformIndexHtml: (
          html: string,
          context: { filename: string; path: string },
        ) => string;
      };
      const html = plugin.transformIndexHtml(
        "<body><!-- initial-page --></body>",
        { filename: "/site/index.html", path: "/index.html" },
      );
      expect(html).toContain(renderInitialPage(content));
      expect(html).not.toContain("<!-- initial-");
    } finally {
      content.footer.text = previousFooter;
    }
  });
  test("current copy validates and all sections render in their array order", () => {
    const copy = validateInitialPageContent(draft());
    const html = renderInitialPage(copy);
    expect(copy.sections).toHaveLength(4);
    expect(html.indexOf("Mail Drops</h2>")).toBeLessThan(
      html.indexOf("About the Artist</h2>"),
    );
    copy.sections.reverse();
    const reversed = renderInitialPage(copy);
    expect(reversed.indexOf("Frequent Questions</h2>")).toBeLessThan(
      reversed.indexOf("Mail Drops</h2>"),
    );
  });
  test("sections can be added and images removed without special section types", () => {
    const copy = validateInitialPageContent(draft());
    copy.sections = [
      {
        title: "New section",
        body: "<p>Welcome <strong>friends</strong>.</p>",
      },
    ];
    const html = renderInitialPage(copy);
    expect(html).toContain("New section</h2>");
    expect(html).not.toContain('class="section-image"');
  });
  test("editable labels do not change registration field names or constraints", () => {
    const copy = draft();
    copy.join.fields.name.label = "Your full name";
    copy.join.fields.email.placeholder = "Email me here";
    const html = renderInitialPage(copy);
    expect(html).toContain('for="name">Your full name</label>');
    expect(html).toContain(
      'name="name" placeholder="Name" maxlength="200" required',
    );
    expect(html).toContain(
      'name="email" placeholder="Email me here" maxlength="320" required',
    );
    expect(html).toContain('name="address"');
    expect(html).toContain('name="birthday"');
  });
  test("plain copy is escaped in markup", () => {
    const copy = draft();
    copy.join.title = '<script>alert("test")</script>';
    expect(renderInitialPage(copy)).toContain(
      "&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;",
    );
  });
  test("metadata, branding and plan labels remain code-owned", async () => {
    for (const key of ["metadata", "branding", "planLabels"]) {
      expect(() =>
        validateInitialPageContent({ ...draft(), [key]: {} }),
      ).toThrow();
    }
    const html = renderInitialPage(draft());
    expect(html).toContain('aria-label="Dream-Rock Collective"');
    expect(html).toContain('src="/dream-rock.png" alt="Dream-Rock"');
    expect(html).toContain('src="/collective.png" alt="Collective"');
    const index = await Bun.file(
      new URL("../index.html", import.meta.url),
    ).text();
    expect(index).toContain("<title>Dream-Rock Collective</title>");
    expect(index).toContain(
      'property="og:image:alt" content="A rock with googly eyes"',
    );
  });
  test("templates substitute data without interpreting it", () => {
    expect(
      formatContentTemplate("Thanks {firstName}!", { firstName: "$& {plan}" }),
    ).toBe("Thanks $& {plan}!");
    const copy = draft();
    copy.member.overlayHeading = "{unknown}";
    expect(() => validateInitialPageContent(copy)).toThrow(
      "Unsupported variable",
    );
  });
  test("rejects invalid structures and image paths", () => {
    for (const src of [
      "https://example.com/a.png",
      "//example.com/a.png",
      "/../secret.png",
      "/%2e%2e/secret.png",
      "/a.png?x=1",
    ]) {
      const copy = draft();
      copy.sections[0]!.image!.src = src;
      expect(() => validateInitialPageContent(copy)).toThrow();
    }
    expect(() =>
      validateInitialPageContent({ ...draft(), surprise: true }),
    ).toThrow();
    expect(() =>
      validateInitialPageContent({ ...draft(), sections: null }),
    ).toThrow();
  });
});
describe("restricted rich text", () => {
  test("accepts supported balanced markup and safe links", () => {
    validateRichText(
      '<p><strong>Question?</strong><br>Answer <em>here</em> <a href="https://example.com/?a=1&amp;b=2">read</a></p><ul><li>One</li></ul>',
    );
    validateRichText(
      '<p><a href="mailto:hello@example.com">Email</a> <a href="/registered/">Next</a></p>',
    );
  });
  test("rejects executable markup, attributes, malformed nesting and encoded link schemes", () => {
    for (const html of [
      "<script>alert(1)</script>",
      '<img src="x" onerror="alert(1)">',
      '<p onclick="x">Hi</p>',
      '<a href="javascript:alert(1)">x</a>',
      '<a href="jav&#97;script:alert(1)">x</a>',
      '<a href="//example.com">x</a>',
      '<a href="https://example.com" target="x">x</a>',
      "<p><strong>x</p></strong>",
      "<p><ul><li>x</li></ul></p>",
      '<a href="/x"><a href="/y">x</a></a>',
      "<!-- hidden -->",
      "<p",
      "<P>x</P>",
    ]) {
      expect(() => validateRichText(html)).toThrow();
    }
  });
});
