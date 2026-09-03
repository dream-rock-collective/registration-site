import "./style.css";
import { getMember } from "./member";

const heading = document.querySelector<HTMLElement>(
  "#newsletter-thanks-heading",
);
const bannerHeading = document.querySelector<HTMLElement>(
  "#newsletter-thanks-banner",
);
const member = getMember();

if (heading && member?.name) {
  const firstName = member.name.trim().split(/\s+/)[0];
  bannerHeading?.replaceChildren(`Thanks ${firstName}!`);
  heading.textContent = `Thank you, ${firstName}!`;
}
