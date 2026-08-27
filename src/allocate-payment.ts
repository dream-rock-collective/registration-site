import "./style.css";
import {
  completePendingPlan,
  getMember,
  saveAllocation,
  type MemberPlan,
} from "./member";

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
type Organization = (typeof ORGANIZATIONS)[number];
const ALLOCATION_DRAG_TYPE = "application/x-drc-allocation";

type AllocationDragData = {
  source: Organization | null;
  dollarIndex?: number;
};

const member = getMember();
const budget = member && member.plan !== "free" ? PLAN_BUDGETS[member.plan] : 0;
const allocation = Object.fromEntries(
  ORGANIZATIONS.map((organization) => [organization, 0]),
) as Record<Organization, number>;
const dollarAssignments: Array<Organization | null> = Array.from(
  { length: budget },
  () => null,
);
const savedAllocation = member?.allocation;
const savedTotal = ORGANIZATIONS.reduce(
  (total, organization) => total + (savedAllocation?.[organization] || 0),
  0,
);
let hasSavedAllocation = false;
if (
  savedAllocation &&
  savedTotal <= budget &&
  ORGANIZATIONS.every((organization) => {
    const value = savedAllocation[organization];
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
  })
) {
  let dollarIndex = 0;
  ORGANIZATIONS.forEach((organization) => {
    const amount = savedAllocation[organization] ?? 0;
    allocation[organization] = amount;
    for (let index = 0; index < amount; index += 1) {
      dollarAssignments[dollarIndex] = organization;
      dollarIndex += 1;
    }
  });
  hasSavedAllocation = savedTotal === budget;
}
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
const successOverlay = document.querySelector<HTMLElement>(
  "#allocation-success",
);
const changeButton =
  document.querySelector<HTMLButtonElement>("#allocation-change");
const hasPayment = Boolean(member && member.plan !== "free");

if (!hasPayment) {
  unavailableOverlay?.removeAttribute("hidden");
}
if (hasPayment && hasSavedAllocation) {
  successOverlay?.removeAttribute("hidden");
}

changeButton?.addEventListener("click", () => {
  successOverlay?.setAttribute("hidden", "true");
});

if (hasPayment && member?.name && bannerName) {
  bannerName.textContent = `Thanks ${member.name.trim().split(/\s+/)[0]}!`;
}
if (member?.plan && member.plan !== "free" && bannerType) {
  const labels = { once: "One Time", monthly: "Monthly", yearly: "Yearly" };
  bannerType.replaceChildren(
    document.createTextNode("You're a "),
    Object.assign(document.createElement("strong"), {
      textContent: labels[member.plan],
    }),
    document.createTextNode(" supporter"),
  );
}

function setMessage(value: string) {
  if (message) message.textContent = value;
}

function moveDollar(
  organization: Organization,
  dragData: AllocationDragData,
): boolean {
  const allocated = Object.values(allocation).reduce(
    (total, value) => total + value,
    0,
  );

  if (
    dragData.source &&
    dragData.source !== organization &&
    allocation[dragData.source] > 0
  ) {
    const dollarIndex =
      dragData.dollarIndex !== undefined &&
      dollarAssignments[dragData.dollarIndex] === dragData.source
        ? dragData.dollarIndex
        : dollarAssignments.findIndex(
            (assignment) => assignment === dragData.source,
          );
    if (dollarIndex >= 0) {
      dollarAssignments[dollarIndex] = organization;
      allocation[dragData.source] -= 1;
      allocation[organization] += 1;
      return true;
    }
  }

  if (
    dragData.source === null &&
    dragData.dollarIndex !== undefined &&
    dollarAssignments[dragData.dollarIndex] === null &&
    allocated < budget
  ) {
    dollarAssignments[dragData.dollarIndex] = organization;
    allocation[organization] += 1;
    return true;
  }

  return false;
}

function render() {
  const allocated = Object.values(allocation).reduce(
    (total, value) => total + value,
    0,
  );
  if (pool) {
    pool.innerHTML = dollarAssignments
      .map((assignment, index) => {
        const isAllocated = assignment !== null;
        return `<span class="allocation-dollar${isAllocated ? " is-allocated" : ""}" data-dollar-index="${index}" aria-hidden="true">$1</span>`;
      })
      .join("");
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
          { length: Math.max(budget - amount, 0) },
          () => '<span class="allocation-slot allocation-drop-target"></span>',
        ).join("");
      }
      if (allocatedSlots) {
        allocatedSlots.innerHTML = dollarAssignments
          .map((assignment, index) =>
            assignment === organization
              ? `<span class="allocation-slot is-allocated" draggable="true" data-organization="${organization}" data-dollar-index="${index}">$1</span>`
              : "",
          )
          .join("");
      }
      if (addButton) addButton.disabled = !hasPayment || allocated >= budget;
    });
  bindDraggableDollars();
  bindDraggableAllocatedSlots();
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
        const dragData = getDragData(event);
        if (organization && dragData && moveDollar(organization, dragData)) {
          render();
        }
      });
    });
}

type TouchDrag = {
  data: AllocationDragData;
  element: HTMLElement;
  pointerId: number;
  column: HTMLElement | null;
};

let touchDrag: TouchDrag | null = null;

function startTouchDrag(
  event: PointerEvent,
  element: HTMLElement,
  data: AllocationDragData,
) {
  if (!hasPayment || event.pointerType === "mouse") return;
  event.preventDefault();
  touchDrag = { data, element, pointerId: event.pointerId, column: null };
  element.setPointerCapture(event.pointerId);
  element.classList.add("is-dragging");
}

function updateTouchDrag(event: PointerEvent) {
  if (!touchDrag || event.pointerId !== touchDrag.pointerId) return;
  event.preventDefault();
  const target = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest<HTMLElement>(".allocation-column") ?? null;
  if (touchDrag.column === target) return;
  touchDrag.column?.classList.remove("is-drag-over");
  touchDrag.column = target;
  target?.classList.add("is-drag-over");
}

function finishTouchDrag(event: PointerEvent, cancelled = false) {
  if (!touchDrag || event.pointerId !== touchDrag.pointerId) return;
  event.preventDefault();
  const { data, element, column } = touchDrag;
  touchDrag = null;
  element.classList.remove("is-dragging");
  column?.classList.remove("is-drag-over");
  try {
    element.releasePointerCapture(event.pointerId);
  } catch {
    // The pointer may already have been released by the browser.
  }
  const organization = column?.dataset["organization"] as Organization;
  if (!cancelled && organization && moveDollar(organization, data)) render();
}

document.addEventListener("pointermove", updateTouchDrag);
document.addEventListener("pointerup", finishTouchDrag);
document.addEventListener("pointercancel", (event) =>
  finishTouchDrag(event, true),
);

function bindDraggableDollars() {
  document
    .querySelectorAll<HTMLElement>(".allocation-dollar:not(.is-allocated)")
    .forEach((dollar) => {
      const dollarIndex = Number(dollar.dataset["dollarIndex"]);
      if (!Number.isInteger(dollarIndex)) return;
      dollar.setAttribute("draggable", "true");
      dollar.addEventListener("dragstart", (event) => {
        setDragData(event, { source: null, dollarIndex });
        dollar.classList.add("is-dragging");
      });
      dollar.addEventListener("pointerdown", (event) => {
        startTouchDrag(event, dollar, { source: null, dollarIndex });
      });
      dollar.addEventListener("dragend", () => {
        dollar.classList.remove("is-dragging");
        document
          .querySelectorAll<HTMLElement>(".allocation-column.is-drag-over")
          .forEach((column) => column.classList.remove("is-drag-over"));
      });
    });
}

function getDragData(event: DragEvent): AllocationDragData | null {
  const value = event.dataTransfer?.getData(ALLOCATION_DRAG_TYPE);
  if (!value) return null;

  try {
    const data = JSON.parse(value) as AllocationDragData;
    if (
      data.source !== null &&
      !ORGANIZATIONS.includes(data.source as Organization)
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setDragData(event: DragEvent, data: AllocationDragData) {
  event.dataTransfer?.setData(ALLOCATION_DRAG_TYPE, JSON.stringify(data));
  event.dataTransfer?.setData("text/plain", "allocation-dollar");
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function bindDraggableAllocatedSlots() {
  document
    .querySelectorAll<HTMLElement>(".allocation-slot.is-allocated")
    .forEach((slot) => {
      const source = slot.dataset["organization"] as Organization;
      const dollarIndex = Number(slot.dataset["dollarIndex"]);
      slot.addEventListener("dragstart", (event) => {
        setDragData(event, {
          source,
          ...(Number.isInteger(dollarIndex) ? { dollarIndex } : {}),
        });
        slot.classList.add("is-dragging");
      });
      slot.addEventListener("pointerdown", (event) => {
        startTouchDrag(event, slot, {
          source,
          ...(Number.isInteger(dollarIndex) ? { dollarIndex } : {}),
        });
      });
      slot.addEventListener("dragend", () => {
        slot.classList.remove("is-dragging");
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
      const dollarIndex = dollarAssignments.findIndex(
        (assignment) => assignment === null,
      );
      if (organization && dollarIndex >= 0 && allocated < budget) {
        dollarAssignments[dollarIndex] = organization;
        allocation[organization] += 1;
      }
      render();
    });
  });

resetButton?.addEventListener("click", () => {
  ORGANIZATIONS.forEach((organization) => {
    allocation[organization] = 0;
  });
  dollarAssignments.fill(null);
  setMessage("");
  render();
});

distributeButton?.addEventListener("click", () => {
  if (!hasPayment) return;
  ORGANIZATIONS.forEach((organization) => {
    allocation[organization] = 0;
  });
  dollarAssignments.fill(null);
  for (let index = 0; index < budget; index += 1) {
    const dollarIndex = index;
    const organization =
      ORGANIZATIONS[Math.floor(Math.random() * ORGANIZATIONS.length)]!;
    dollarAssignments[dollarIndex] = organization;
    allocation[organization] += 1;
  }
  render();
});

submitButton?.addEventListener("click", async () => {
  if (!hasPayment) return;
  if (!member?.userId) {
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
      body: JSON.stringify({ userId: member.userId, allocation }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(body.error || "We could not save your allocation.");
    saveAllocation(member.userId, allocation);
    setMessage("");
    successOverlay?.removeAttribute("hidden");
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
