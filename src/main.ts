import "./style.css";
import initialContent from "../content/initial-page.json";
import { formatContentTemplate, validateInitialPageContent } from "./content";
import { getMember, saveRegistration } from "./member";

const content = validateInitialPageContent(initialContent);

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
const memberOverlay = document.querySelector<HTMLElement>("#member-overlay");
const memberOverlayHeading = document.querySelector<HTMLElement>(
  "#member-overlay-heading",
);
const memberOverlayPlan = document.querySelector<HTMLElement>(
  "#member-overlay-plan",
);
const newRegistrationButton =
  document.querySelector<HTMLButtonElement>("#new-registration");

let apiHealthy = false;

const existingMember = getMember();
if (
  existingMember &&
  memberOverlay &&
  memberOverlayHeading &&
  memberOverlayPlan
) {
  const firstName = existingMember.name.trim().split(/\s+/)[0];
  memberOverlayHeading.textContent = formatContentTemplate(
    content.member.overlayHeading,
    { firstName: firstName ?? "" },
  );
  memberOverlayPlan.textContent = formatContentTemplate(
    content.member.overlayPlan,
    { plan: content.planLabels[existingMember.plan] },
  );
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

  if ([registration.name, registration.email].some((value) => !value)) {
    setFormMessage(content.messages.required);
    return;
  }

  submitButton.disabled = true;
  setFormMessage(content.messages.submitting);

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
      setFormMessage(fieldErrors || body.error || content.messages.saveFailed);
      submitButton.disabled = false;
      return;
    }

    const userId = body.userId ?? body.id ?? body.registration?.id;
    if (!userId) {
      setFormMessage(content.messages.paymentFailed);
      submitButton.disabled = false;
      return;
    }

    saveRegistration(registration.name, String(userId));

    window.location.href = `/registered/?userId=${encodeURIComponent(String(userId))}`;
  } catch {
    setFormMessage(content.messages.networkFailed);
    submitButton.disabled = false;
  }
});

void checkHealth();
