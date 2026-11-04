import { expect, test, type Page } from "@playwright/test";
import content from "../content/initial-page.json" with { type: "json" };
import { renderPage } from "../src/render-page";

const keys = content.donations.sections.map((section) => section.key);
async function member(page: Page, allocation?: Record<string, number>) {
  await page.addInitScript(
    (value) => localStorage.setItem("dream-rock-member", JSON.stringify(value)),
    {
      name: "Test Member",
      userId: "test-user",
      plan: "monthly",
      allocation,
    },
  );
}
async function customCharities(page: Page) {
  const copy = structuredClone(content);
  copy.donations.sections = [
    {
      key: "new-charity",
      title: "New Charity",
      url: "https://example.com",
      body: "<p>New local work</p>",
    },
    ...copy.donations.sections.reverse(),
  ];
  await page.route("**/content/initial-page.json*", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `export default ${JSON.stringify(copy)};`,
    }),
  );
  await page.route("**/allocate-payment/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html class="subscription-document"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body class="subscription-page-body">${renderPage(copy, "donations")}<script type="module" src="/src/allocate-payment.ts"></script></body></html>`,
    }),
  );
  return copy.donations.sections.map((section) => section.key);
}

test("all pages render converted content and keep checkout plan choices", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Mail Drops", exact: true }),
  ).toBeVisible();
  await page.goto("/registered/?userId=test-user");
  await expect(
    page.getByRole("heading", {
      name: content.subscriptions.title,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("[data-plan]")).toHaveCount(3);
  await expect(page.locator('[data-plan="monthly"]')).toContainText("$10/mo");
  await expect(page.locator(".subscription-copy article")).toHaveCount(
    content.subscriptions.sections.length,
  );
  await page.goto("/success/");
  await expect(page.getByRole("heading")).toHaveText(content.success.title);
});

test("charity order matches in both areas and submits the legacy dollar payload", async ({
  page,
}) => {
  await member(page);
  const orderedKeys = await customCharities(page);
  await page.route("**/submit-allocation", (route) =>
    route.fulfill({ json: { success: true } }),
  );
  await page.goto("/allocate-payment/");
  await expect(page.locator(".allocation-column")).toHaveCount(4);
  expect(
    await page
      .locator(".allocation-column")
      .evaluateAll((columns) =>
        columns.map((column) => column.getAttribute("data-organization")),
      ),
  ).toEqual(orderedKeys);
  await expect(page.locator(".allocate-payment-copy h2")).toHaveText([
    "New Charity",
    "Otay Mesa Detention Resistance",
    "Indigenous Climate Action",
    "We All We Got SD",
  ]);
  const add = page.locator('[data-organization="new-charity"] .allocation-add');
  for (let i = 0; i < 5; i++) await add.click();
  const request = page.waitForRequest("**/submit-allocation");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  expect((await request).postDataJSON()).toEqual({
    userId: "test-user",
    allocation: {
      "new-charity": 5,
      otayMesaDetentionResistance: 0,
      indigenousClimateAction: 0,
      weAllWeGotSd: 0,
    },
  });
  await expect(page.locator("#allocation-success")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("dream-rock-member")!)[0].allocation,
    ),
  ).toEqual({
    "new-charity": 5,
    otayMesaDetentionResistance: 0,
    indigenousClimateAction: 0,
    weAllWeGotSd: 0,
  });
});

test("removed or renamed saved charity keys require fresh allocation", async ({
  page,
}) => {
  await member(page, { [keys[0]!]: 3, removedCharity: 2 });
  await page.goto("/allocate-payment/");
  await expect(page.locator("#allocation-success")).toBeHidden();
  await expect(
    page.locator(".allocation-dollar:not(.is-allocated)"),
  ).toHaveCount(5);
  await expect(
    page.getByRole("button", { name: "Submit", exact: true }),
  ).toBeDisabled();
});

test("unchanged saved keys restore even when their order changes", async ({
  page,
}) => {
  await member(page, {
    "new-charity": 0,
    otayMesaDetentionResistance: 0,
    indigenousClimateAction: 2,
    weAllWeGotSd: 3,
  });
  await customCharities(page);
  await page.goto("/allocate-payment/");
  await expect(page.locator("#allocation-success")).toBeVisible();
  await page.getByRole("button", { name: "Change Allocation" }).click();
  await expect(
    page.locator(
      '[data-organization="weAllWeGotSd"] .allocation-filled-slots .is-allocated',
    ),
  ).toHaveCount(3);
  await expect(
    page.locator(
      '[data-organization="indigenousClimateAction"] .allocation-filled-slots .is-allocated',
    ),
  ).toHaveCount(2);
});

test("visitors without payment cannot allocate or submit", async ({ page }) => {
  await page.goto("/allocate-payment/");
  await expect(
    page.getByText("No payment received", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Submit", exact: true }),
  ).toBeDisabled();
});
