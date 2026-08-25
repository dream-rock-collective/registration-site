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
const distributeButton = document.querySelector<HTMLButtonElement>(
  "#distribute-randomly",
);
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
      const isAllocated = index < allocated;
      return `<span class="allocation-dollar${isAllocated ? " is-allocated" : ""}" aria-hidden="true">$1</span>`;
    }).join("");
    pool.setAttribute("aria-label", `${budget - allocated} dollars available`);
  }

  document
    .querySelectorAll<HTMLElement>(".allocation-column")
    .forEach((column) => {
      const organization = column.dataset["organization"] as Organization;
      const amount = allocation[organization];
      const emptySlots = column.querySelector<HTMLElement>(".allocation-slots");
      const allocatedSlots = column.querySelector<HTMLElement>(
        ".allocation-filled-slots",
      );
      const addButton =
        column.querySelector<HTMLButtonElement>(".allocation-add");
      if (emptySlots) {
        emptySlots.innerHTML = Array.from(
          { length: Math.max(MINIMUM_SLOT_COUNT - amount, 0) },
          () => '<span class="allocation-slot allocation-drop-target"></span>',
        ).join("");
      }
      if (allocatedSlots) {
        allocatedSlots.innerHTML = Array.from(
          { length: amount },
          () => '<span class="allocation-slot is-allocated">$1</span>',
        ).join("");
      }
      if (addButton) addButton.disabled = !hasPayment || allocated >= budget;
    });
  bindDraggableDollars();
  if (submitButton) submitButton.disabled = !hasPayment || allocated !== budget;
}

function bindDropTargets() {
  document
    .querySelectorAll<HTMLElement>(".allocation-column")
    .forEach((column) => {
      column.addEventListener("dragover", (event) => {
        if (!hasPayment) return;
        event.preventDefault();
        column.classList.add("is-drag-over");
      });
      column.addEventListener("dragleave", (event) => {
        if (!column.contains(event.relatedTarget as Node | null)) {
          column.classList.remove("is-drag-over");
        }
      });
      column.addEventListener("drop", (event) => {
        event.preventDefault();
        column.classList.remove("is-drag-over");
        const organization = column.dataset["organization"] as Organization;
        const allocated = Object.values(allocation).reduce(
          (total, value) => total + value,
          0,
        );
        if (organization && allocated < budget) {
          allocation[organization] += 1;
          render();
        }
      });
    });
}

function bindDraggableDollars() {
  document
    .querySelectorAll<HTMLElement>(".allocation-dollar:not(.is-allocated)")
    .forEach((dollar) => {
      dollar.setAttribute("draggable", "true");
      dollar.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData("text/plain", "one-dollar");
        dollar.classList.add("is-dragging");
      });
      dollar.addEventListener("dragend", () => {
        dollar.classList.remove("is-dragging");
        document
          .querySelectorAll<HTMLElement>(".allocation-column.is-drag-over")
          .forEach((column) => column.classList.remove("is-drag-over"));
      });
    });
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

distributeButton?.addEventListener("click", () => {
  if (!hasPayment) return;
  ORGANIZATIONS.forEach((organization) => {
    allocation[organization] = 0;
  });
  for (let index = 0; index < budget; index += 1) {
    const organization =
      ORGANIZATIONS[Math.floor(Math.random() * ORGANIZATIONS.length)]!;
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
  distributeButton?.setAttribute("disabled", "true");
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
    distributeButton?.removeAttribute("disabled");
  }
});

render();
bindDropTargets();
