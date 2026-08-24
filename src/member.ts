const MEMBER_STORAGE_KEY = "dream-rock-member";
const PENDING_PLAN_STORAGE_KEY = "dream-rock-pending-plan";

export type MemberPlan = "free" | "monthly" | "once" | "yearly";

export type Member = {
  name: string;
  plan: MemberPlan;
  registrationId?: string;
  paymentDate?: string;
};

type PendingPlan = {
  plan: Exclude<MemberPlan, "free">;
};

function readStorage<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage may be unavailable in private browsing or restricted contexts.
  }
}

export function getMember(): Member | null {
  const member = readStorage<Member>(MEMBER_STORAGE_KEY);
  return member?.name && member.plan ? member : null;
}

export function saveRegistration(name: string, registrationId?: string) {
  writeStorage(MEMBER_STORAGE_KEY, {
    name,
    plan: "free" satisfies MemberPlan,
    registrationId,
  });
}

export function savePendingPlan(plan: string | undefined) {
  if (plan !== "monthly" && plan !== "once" && plan !== "yearly") return;
  writeStorage(PENDING_PLAN_STORAGE_KEY, { plan } satisfies PendingPlan);
}

export function completePendingPlan() {
  const member = getMember();
  const pending = readStorage<PendingPlan>(PENDING_PLAN_STORAGE_KEY);
  if (!member || !pending || !pending.plan) return;

  writeStorage(MEMBER_STORAGE_KEY, {
    ...member,
    plan: pending.plan,
    paymentDate: new Date().toISOString(),
  } satisfies Member);

  try {
    window.localStorage.removeItem(PENDING_PLAN_STORAGE_KEY);
  } catch {
    // Local storage may be unavailable in private browsing or restricted contexts.
  }
}

export function formatPlan(member: Member): string {
  if (member.plan === "free") return "free tier";
  if (member.plan === "monthly") return "monthly";
  if (member.plan === "yearly") return "yearly";

  const date = member.paymentDate ? new Date(member.paymentDate) : null;
  const formattedDate =
    date && !Number.isNaN(date.valueOf())
      ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date)
      : "date unavailable";
  return `one time — paid ${formattedDate}`;
}
