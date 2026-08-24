import "./style.css";
import { completePendingPlan, getMember, type MemberPlan } from "./member";

completePendingPlan();

const isLocalSite =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const API_BASE_URL =
  import.meta.env["VITE_API_BASE_URL"] ||
  (isLocalSite ? "http://localhost:6942" : "https://api.dreamrock.co");

const PLAN_BUDGETS: Record<Exclude<MemberPlan, "free">, number> = {
  once: 6,
  monthly: 5,
  yearly: 5,
};

const ORGANIZATIONS = [
  "weAllWeGotSd",
  "indigenousClimateAction",
  "otayMesaDetentionResistance",
] as const;
const MINIMUM_SLOT_COUNT = 4;
type Organization = (typeof ORGANIZATIONS)[number];

const member = getMember();
const budget = member && member.plan !== "free" ? PLAN_BUDGETS[member.plan] : 0;
const allocation = Object.fromEntries(
  ORGANIZATIONS.map((organization) => [organization, 0]),
) as Record<Organization, number>;
const pool = document.querySelector<HTMLElement>("#allocation-pool");
const message = document.querySelector<HTMLElement>("#allocation-message");
const submitButton =
  document.querySelector<HTMLButtonElement>("#allocation-submit");
const resetButton =
  document.querySelector<HTMLButtonElement>("#allocation-reset");
const splitButton = document.querySelector<HTMLButtonElement>("#split-evenly");
const bannerName = document.querySelector<HTMLElement>("#subscription-thanks");
const bannerType = document.querySelector<HTMLElement>("#subscription-type");
const unavailableOverlay = document.querySelector<HTMLElement>(
  "#allocation-unavailable",
);
const hasPayment = Boolean(member && member.plan !== "free");

if (!hasPayment) {
  unavailableOverlay?.removeAttribute("hidden");
}

if (member?.name && bannerName) {
  bannerName.textContent = `Thanks ${member.name.trim().split(/\s+/)[0]}!`;
}
if (member?.plan && member.plan !== "free" && bannerType) {
  const labels = { once: "One Time", monthly: "Monthly", yearly: "Yearly" };
  bannerType.textContent = `You're a ${labels[member.plan]} supporter`;
}

function setMessage(value: string) {
  if (message) message.textContent = value;
}

function render() {
  const allocated = Object.values(allocation).reduce(
    (total, value) => total + value,
    0,
  );
  if (pool) {
    pool.innerHTML = Array.from({ length: budget }, (_, index) => {
      const available = index >= allocated;
      return `<span class="allocation-dollar${available ? " is-available" : ""}" aria-hidden="true">$1</span>`;
    }).join("");
    pool.setAttribute("aria-label", `${budget - allocated} dollars available`);
  }

  document
    .querySelectorAll<HTMLElement>(".allocation-column")
    .forEach((column) => {
      const organization = column.dataset["organization"] as Organization;
      const amount = allocation[organization];
      const slots = column.querySelector<HTMLElement>(".allocation-slots");
      const total = column.querySelector<HTMLElement>(".allocation-total");
      const addButton =
        column.querySelector<HTMLButtonElement>(".allocation-add");
      if (slots) {
        slots.innerHTML = Array.from(
          { length: Math.max(MINIMUM_SLOT_COUNT, amount) },
          (_, index) =>
            `<span class="allocation-slot">${index < amount ? "$1" : ""}</span>`,
        ).join("");
      }
    if (total) {
      total.textContent = amount ? `$${amount}` : "";
      total.classList.toggle("is-empty", amount === 0);
    }
      if (addButton) addButton.disabled = !hasPayment || allocated >= budget;
    });
  if (submitButton) submitButton.disabled = !hasPayment || allocated !== budget;
}

document
  .querySelectorAll<HTMLButtonElement>(".allocation-add")
  .forEach((button) => {
    button.addEventListener("click", () => {
      if (!hasPayment) return;
      const organization = button.closest<HTMLElement>(".allocation-column")
        ?.dataset["organization"] as Organization;
      const allocated = Object.values(allocation).reduce(
        (total, value) => total + value,
        0,
      );
      if (organization && allocated < budget) allocation[organization] += 1;
      render();
    });
  });

resetButton?.addEventListener("click", () => {
  ORGANIZATIONS.forEach((organization) => {
    allocation[organization] = 0;
  });
  setMessage("");
  render();
});

splitButton?.addEventListener("click", () => {
  if (!hasPayment) return;
  ORGANIZATIONS.forEach((organization) => {
    allocation[organization] = 0;
  });
  for (let index = 0; index < budget; index += 1) {
    const organization = ORGANIZATIONS[index % ORGANIZATIONS.length]!;
    allocation[organization] += 1;
  }
  render();
});

submitButton?.addEventListener("click", async () => {
  if (!hasPayment) return;
  if (!member?.registrationId) {
    setMessage("We could not find your registration. Please register again.");
    return;
  }
  submitButton.disabled = true;
  resetButton?.setAttribute("disabled", "true");
  splitButton?.setAttribute("disabled", "true");
  setMessage("Submitting your allocation…");
  try {
    const response = await fetch(`${API_BASE_URL}/submit-allocation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: member.registrationId, allocation }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(body.error || "We could not save your allocation.");
    setMessage("Thank you! Your allocation has been saved.");
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "We could not save your allocation. Please try again.",
    );
    submitButton.disabled = false;
    resetButton?.removeAttribute("disabled");
    splitButton?.removeAttribute("disabled");
  }
});

render();
