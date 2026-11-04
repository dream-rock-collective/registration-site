import { describe, expect, test } from "bun:test";
import { previewMessage, previewSettings } from "../src/preview-messages.ts";
import { readFile } from "node:fs/promises";

const parent = {};
const settings = {
  parentOrigin: "https://admin.example.test",
  token: "a".repeat(64),
};
const data = {
  type: "drc-preview-content",
  token: settings.token,
  content: { preview: true },
};

describe("isolated preview messaging", () => {
  test("accepts only configured parent origins and frame tokens", () => {
    expect(
      previewSettings(
        `?parentOrigin=${encodeURIComponent(settings.parentOrigin)}&token=${settings.token}`,
      ),
    ).toEqual(settings);
    for (const origin of [
      "null",
      "javascript:alert(1)",
      "https://admin.example.test/path",
      "https://user:password@admin.example.test",
    ]) {
      expect(() =>
        previewSettings(
          `?parentOrigin=${encodeURIComponent(origin)}&token=${settings.token}`,
        ),
      ).toThrow();
    }
    expect(() =>
      previewSettings(
        `?parentOrigin=${encodeURIComponent(settings.parentOrigin)}&token=short`,
      ),
    ).toThrow();
  });

  test("accepts content only from the parent with matching origin, message type, and token", () => {
    const event = { source: parent, origin: settings.parentOrigin, data };
    expect(previewMessage(event, parent, settings)).toEqual({
      content: data.content,
    });
    expect(
      previewMessage({ ...event, source: {} }, parent, settings),
    ).toBeUndefined();
    expect(
      previewMessage(
        { ...event, origin: "https://other.example" },
        parent,
        settings,
      ),
    ).toBeUndefined();
    expect(
      previewMessage({ ...event, origin: "null" }, parent, settings),
    ).toBeUndefined();
    expect(
      previewMessage(
        { ...event, data: { ...data, token: "b".repeat(64) } },
        parent,
        settings,
      ),
    ).toBeUndefined();
    expect(
      previewMessage(
        { ...event, data: { ...data, type: "other" } },
        parent,
        settings,
      ),
    ).toBeUndefined();
    expect(
      previewMessage({ ...event, data: null }, parent, settings),
    ).toBeUndefined();
  });

  test("entrypoint has no registration or member state dependency", async () => {
    const entry = await readFile(
      new URL("../src/preview.ts", import.meta.url),
      "utf8",
    );
    expect(entry).not.toMatch(
      /from ["']\.\/(main|member|registered|allocate-payment)/,
    );
    expect(entry).not.toMatch(/\b(fetch|localStorage|sessionStorage)\s*[.(]/);
    expect(entry).toContain('document.addEventListener("submit"');
    expect(entry).toContain("field.disabled = true");
  });
});
