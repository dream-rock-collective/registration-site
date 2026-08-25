import "./style.css";
import { getMember, savePendingPlan } from "./member";

const isLocalSite =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const API_BASE_URL =
  import.meta.env["VITE_API_BASE_URL"] ||
  (isLocalSite ? "http://localhost:6942" : "https://api.dreamrock.co");
const registrationId = new URLSearchParams(window.location.search).get(
  "registrationId",
);
const checkoutButtons =
  document.querySelectorAll<HTMLButtonElement>("[data-plan]");
const greeting = document.querySelector<HTMLElement>("#subscription-thanks");
const member = getMember();
if (greeting && member?.name) {
  const firstName = member.name.trim().split(/\s+/)[0];
  greeting.textContent = `Thanks ${firstName}!`;
}

checkoutButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (!registrationId) {
      window.alert(
        "We could not find your registration. Please register again.",
      );
      return;
    }

    button.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: registrationId, plan: button.dataset["plan"] }),
      });
      const body = await response.json();

      if (!response.ok || typeof body.url !== "string") {
        throw new Error(body.error || "Checkout is unavailable.");
      }

      savePendingPlan(button.dataset["plan"], registrationId);

      window.location.href = body.url;
    } catch (error) {
      button.disabled = false;
      window.alert(
        error instanceof Error
          ? error.message
          : "We could not start checkout. Please try again.",
      );
    }
  });
});
