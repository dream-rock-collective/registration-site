import "./style.css";
import {
  formatPlan,
  formatPlanLabel,
  getMember,
  saveRegistration,
} from "./member";

const isLocalSite =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const API_BASE_URL =
  import.meta.env["VITE_API_BASE_URL"] ||
  (isLocalSite ? "http://localhost:6942" : "https://api.dreamrock.co");

const form = document.querySelector<HTMLFormElement>("#signup-form");
const submitButton =
  document.querySelector<HTMLButtonElement>("#signup-submit");
const healthBanner = document.querySelector<HTMLElement>(".health-banner");
const formMessage = document.querySelector<HTMLElement>("#form-message");
const memberBanner = document.querySelector<HTMLElement>("#member-banner");
const memberHeading = document.querySelector<HTMLElement>("#member-heading");
const memberPlan = document.querySelector<HTMLElement>("#member-plan");
const memberOverlay = document.querySelector<HTMLElement>("#member-overlay");
const memberOverlayHeading = document.querySelector<HTMLElement>(
  "#member-overlay-heading",
);
const newRegistrationButton = document.querySelector<HTMLButtonElement>(
  "#new-registration",
);

let apiHealthy = false;

const existingMember = getMember();
if (existingMember && memberBanner && memberHeading && memberPlan) {
  const firstName = existingMember.name.trim().split(/\s+/)[0];
  memberHeading.textContent = `Thanks for being a member, ${firstName}`;
  memberPlan.textContent = formatPlan(existingMember);
  memberBanner.classList.remove("is-hidden");
}
if (existingMember && memberOverlay && memberOverlayHeading) {
  const firstName = existingMember.name.trim().split(/\s+/)[0];
  memberOverlayHeading.textContent = `Thanks ${firstName}! You're a ${formatPlanLabel(existingMember)} member`;
  memberOverlay.removeAttribute("hidden");
}

newRegistrationButton?.addEventListener("click", () => {
  memberOverlay?.setAttribute("hidden", "true");
});

function setHealthState(healthy: boolean) {
  apiHealthy = healthy;
  if (!healthBanner || !submitButton) return;

  healthBanner.classList.toggle("is-hidden", healthy);
  submitButton.disabled = !healthy;
}

function setFormMessage(message: string) {
  if (formMessage) formMessage.textContent = message;
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const body = await response.json();
    setHealthState(response.ok && body.status === "ok");
  } catch {
    setHealthState(false);
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form || !submitButton || !apiHealthy) return;

  const formData = new FormData(form);
  const registration = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    birthday: String(formData.get("birthday") || "").trim(),
  };

  if (
    [registration.name, registration.email, registration.address].some(
      (value) => !value,
    )
  ) {
    setFormMessage("Please provide your name, email, and address.");
    return;
  }

  submitButton.disabled = true;
  setFormMessage("Submitting your registration…");

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registration),
    });
    const body = await response.json();

    if (!response.ok) {
      const fieldErrors = body.fields
        ? Object.values(body.fields).flat().join(" ")
        : "";
      setFormMessage(
        fieldErrors || body.error || "We could not save your registration.",
      );
      submitButton.disabled = false;
      return;
    }

    const userId = body.userId ?? body.id ?? body.registration?.id;
    if (!userId) {
      setFormMessage("Registration saved, but we could not start payment.");
      submitButton.disabled = false;
      return;
    }

    saveRegistration(registration.name, String(userId));

    window.location.href = `/registered/?userId=${encodeURIComponent(String(userId))}`;
  } catch {
    setFormMessage(
      "We could not reach the registration service. Please try again.",
    );
    submitButton.disabled = false;
  }
});

void checkHealth();
