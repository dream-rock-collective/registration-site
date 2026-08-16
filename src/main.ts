import './style.css';

const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] ||
  (import.meta.env.DEV ? 'http://localhost:6942' : 'https://api.dreamrock.co');

const form = document.querySelector<HTMLFormElement>('#signup-form');
const submitButton = document.querySelector<HTMLButtonElement>('#signup-submit');
const healthBanner = document.querySelector<HTMLElement>('.health-banner');
const formMessage = document.querySelector<HTMLElement>('#form-message');

let apiHealthy = false;

function setHealthState(healthy: boolean) {
  apiHealthy = healthy;
  if (!healthBanner || !submitButton) return;

  healthBanner.textContent = healthy
    ? 'Registration is open.'
    : 'Registration is temporarily unavailable.';
  healthBanner.classList.toggle('is-healthy', healthy);
  healthBanner.classList.toggle('is-unhealthy', !healthy);
  submitButton.disabled = !healthy;
}

function setFormMessage(message: string) {
  if (formMessage) formMessage.textContent = message;
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const body = await response.json();
    setHealthState(response.ok && body.status === 'ok');
  } catch {
    setHealthState(false);
  }
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form || !submitButton || !apiHealthy) return;

  const formData = new FormData(form);
  const registration = {
    name: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    address: String(formData.get('address') || '').trim(),
  };

  submitButton.disabled = true;
  setFormMessage('Submitting your registration…');

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registration),
    });
    const body = await response.json();

    if (!response.ok) {
      const fieldErrors = body.fields
        ? Object.values(body.fields).flat().join(' ')
        : '';
      setFormMessage(fieldErrors || body.error || 'We could not save your registration.');
      submitButton.disabled = false;
      return;
    }

    form.reset();
    setFormMessage('Thanks! Your registration has been saved.');
  } catch {
    setFormMessage('We could not reach the registration service. Please try again.');
    submitButton.disabled = false;
  }
});

void checkHealth();
