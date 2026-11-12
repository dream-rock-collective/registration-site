import { expect, test, type Page } from "@playwright/test";
import content from "../content/initial-page.json" with { type: "json" };
import { renderPage } from "../src/render-page";

const keys = content.donations.sections.map((section) => section.key);
async function member(
  page: Page,
  allocation?: Record<string, number>,
  allocationFormat?: "percentage" | "dollars",
  plan = "monthly",
) {
  await page.addInitScript(
    (value) => {
      if (!localStorage.getItem("dream-rock-member")) {
        localStorage.setItem("dream-rock-member", JSON.stringify(value));
      }
    },
    {
      name: "Test Member",
      userId: "test-user",
      plan,
      allocation,
      allocationFormat,
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

test("charity order matches in both areas and submits the percentage payload", async ({
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
    format: "percentage",
    allocation: {
      "new-charity": 100,
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
    "new-charity": 100,
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
  await member(
    page,
    {
      "new-charity": 0,
      otayMesaDetentionResistance: 0,
      indigenousClimateAction: 40,
      weAllWeGotSd: 60,
    },
    "percentage",
  );
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

test("edited subscription labels keep the same checkout payload and prices", async ({
  page,
}) => {
  const copy = structuredClone(content);
  copy.subscriptions.planLabels = {
    once: "Single letter",
    monthly: "Every month",
    yearly: "A full year",
  };
  await page.route("**/registered/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${renderPage(copy, "subscriptions")}<script type="module" src="/src/registered.ts"></script></body></html>`,
    }),
  );
  await page.route("**/create-checkout-session", (route) =>
    route.fulfill({ json: { url: "http://127.0.0.1:5181/checkout-fixture" } }),
  );
  await page.route("**/checkout-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<p>Checkout fixture</p>",
    }),
  );
  await page.goto("/registered/?userId=test-user");
  await expect(page.locator('[data-plan="once"]')).toContainText(
    "Single letter$12",
  );
  await expect(page.locator('[data-plan="yearly"]')).toContainText(
    "A full year$110/yr",
  );
  const request = page.waitForRequest("**/create-checkout-session");
  await page.locator('[data-plan="monthly"]').click();
  expect((await request).postDataJSON()).toEqual({
    userId: "test-user",
    plan: "monthly",
  });
  await expect(page).toHaveURL("http://127.0.0.1:5181/checkout-fixture");
});

for (const plan of ["once", "monthly", "yearly"]) {
  test(`${plan} has five 20% bubbles and requires all five`, async ({
    page,
  }) => {
    await member(page, undefined, undefined, plan);
    await page.goto("/allocate-payment/");
    await expect(page.locator(".allocation-dollar")).toHaveText(
      Array(5).fill("20%"),
    );
    await expect(page.locator("#allocation-remaining")).toHaveText(
      "100% remaining",
    );
    await page.locator(".allocation-add").first().click();
    await expect(page.locator("#allocation-remaining")).toHaveText(
      "80% remaining",
    );
    await expect(page.locator("#allocation-submit")).toBeDisabled();
    await page.locator("#allocation-reset").click();
    await expect(
      page.locator(".allocation-dollar:not(.is-allocated)"),
    ).toHaveCount(5);
    await page.locator("#distribute-randomly").click();
    await expect(page.locator(".allocation-slot.is-allocated")).toHaveCount(5);
    await expect(page.locator("#allocation-remaining")).toHaveText(
      "0% remaining",
    );
    await expect(page.locator("#allocation-submit")).toBeEnabled();
  });
}

for (const [label, allocation, format] of [
  ["legacy dollars", { [keys[0]!]: 5 }, undefined],
  ["explicit dollars", { [keys[0]!]: 100 }, "dollars"],
  ["partial percentages", { [keys[0]!]: 80 }, "percentage"],
  ["unsupported increments", { [keys[0]!]: 30, [keys[1]!]: 70 }, "percentage"],
  ["retired recipient", { removedCharity: 100 }, "percentage"],
] as const) {
  test(`${label} starts fresh without overwriting saved state`, async ({
    page,
  }) => {
    await member(page, allocation, format);
    await page.goto("/allocate-payment/");
    await expect(page.locator("#allocation-success")).toBeHidden();
    await expect(
      page.locator(".allocation-dollar:not(.is-allocated)"),
    ).toHaveCount(5);
    await expect(page.locator("#allocation-message")).toContainText(
      "choose a new percentage allocation",
    );
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("dream-rock-member")!).allocation,
      ),
    ).toEqual(allocation);
  });
}

test("submission freezes choices, preserves failure state, and retries", async ({
  page,
}) => {
  await member(page);
  let release: (() => void) | undefined;
  let attempts = 0;
  await page.route("**/submit-allocation", async (route) => {
    attempts++;
    if (attempts === 1) {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fulfill({ status: 500, json: { error: "Try again" } });
    } else await route.fulfill({ status: 201, json: { allocationId: 17 } });
  });
  await page.goto("/allocate-payment/");
  await page.locator("#distribute-randomly").click();
  await page.locator("#allocation-submit").click();
  await expect(page.locator("#allocation-message")).toHaveText(
    "Submitting your allocation…",
  );
  await expect(page.locator("#allocation-reset")).toBeDisabled();
  await expect(page.locator("#distribute-randomly")).toBeDisabled();
  await expect(page.locator(".allocation-add:enabled")).toHaveCount(0);
  await expect.poll(() => Boolean(release)).toBe(true);
  release!();
  await expect(page.locator("#allocation-message")).toHaveText("Try again");
  await expect(page.locator(".allocation-slot.is-allocated")).toHaveCount(5);
  await page.locator("#allocation-submit").click();
  await expect(page.locator("#allocation-success")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("dream-rock-member")!)[0]
          .allocationFormat,
    ),
  ).toBe("percentage");
  await page.reload();
  await expect(page.locator("#allocation-success")).toBeVisible();
});

test("bubbles move between recipients by mouse or touch", async ({
  page,
  isMobile,
}) => {
  await member(page);
  await page.goto("/allocate-payment/");
  const source = page.locator(".allocation-dollar").first();
  const target = page.locator(".allocation-column").first();
  const move = async (
    from: ReturnType<Page["locator"]>,
    to: ReturnType<Page["locator"]>,
  ) => {
    if (!isMobile) {
      await from.dragTo(to);
      return;
    }
    const box = await to.boundingBox();
    if (!box) throw new Error("Missing drop target");
    await from.dispatchEvent("pointerdown", {
      pointerId: 1,
      pointerType: "touch",
    });
    await page.locator("body").dispatchEvent("pointermove", {
      pointerId: 1,
      pointerType: "touch",
      clientX: box.x + box.width / 2,
      clientY: box.y + box.height / 2,
    });
    await page
      .locator("body")
      .dispatchEvent("pointerup", { pointerId: 1, pointerType: "touch" });
  };
  await move(source, target);
  await expect(target.locator(".is-allocated")).toHaveCount(1);
  const next = page.locator(".allocation-column").nth(1);
  await move(target.locator(".is-allocated"), next);
  await expect(target.locator(".is-allocated")).toHaveCount(0);
  await expect(next.locator(".is-allocated")).toHaveCount(1);
  await expect(page.locator("#allocation-remaining")).toHaveText(
    "80% remaining",
  );
  await next.locator(".allocation-add").focus();
  await page.keyboard.press("Enter");
  await expect(next.locator(".is-allocated")).toHaveCount(2);
});
