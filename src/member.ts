const MEMBER_STORAGE_KEY = "dream-rock-member";
const PENDING_PLAN_STORAGE_KEY = "dream-rock-pending-plan";

export type MemberPlan = "free" | "monthly" | "once" | "yearly";

export type Member = {
  name: string;
  plan: MemberPlan;
  userId?: string;
  paymentDate?: string;
  registeredAt?: string;
  allocation?: Record<string, number>;
};

type PendingPlan = {
  plan: Exclude<MemberPlan, "free">;
  userId?: string;
};

type LegacyMember = Member & { registrationId?: string };
type LegacyPendingPlan = PendingPlan & { registrationId?: string };

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

function readMembers(): Member[] {
  const stored = readStorage<LegacyMember | LegacyMember[]>(MEMBER_STORAGE_KEY);
  const members = Array.isArray(stored)
    ? stored
    : stored?.name && stored.plan
      ? [stored]
      : [];

  return members
    .map(({ registrationId, ...member }) =>
      member.userId || !registrationId
        ? member
        : { ...member, userId: registrationId },
    )
    .filter((member) => member.name && member.plan)
    .sort((left, right) => {
      const leftDate = getMemberDate(left);
      const rightDate = getMemberDate(right);
      return rightDate - leftDate;
    });
}

function getMemberDate(member: Member): number {
  const value = member.registeredAt || member.paymentDate;
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getMember(): Member | null {
  return readMembers()[0] || null;
}

export function saveRegistration(name: string, userId?: string) {
  const members = readMembers();
  const member: Member = {
    name,
    plan: "free" satisfies MemberPlan,
    registeredAt: new Date().toISOString(),
  };
  if (userId !== undefined) member.userId = userId;
  members.push(member);
  writeStorage(MEMBER_STORAGE_KEY, members);
}

export function savePendingPlan(
  plan: string | undefined,
  userId?: string,
) {
  if (plan !== "monthly" && plan !== "once" && plan !== "yearly") return;
  const pending: PendingPlan = {
    plan,
  };
  if (userId !== undefined) pending.userId = userId;
  writeStorage(PENDING_PLAN_STORAGE_KEY, pending);
}

export function completePendingPlan() {
  const storedPending = readStorage<LegacyPendingPlan>(
    PENDING_PLAN_STORAGE_KEY,
  );
  const pending = storedPending && {
    ...storedPending,
    userId: storedPending.userId ?? storedPending.registrationId,
  };
  if (!pending || !pending.plan) return;

  const members = readMembers();
  const memberIndex = pending.userId
    ? members.findIndex(
        (member) => member.userId === pending.userId,
      )
    : 0;
  if (memberIndex < 0 || !members[memberIndex]) return;

  members[memberIndex] = {
    ...members[memberIndex],
    plan: pending.plan,
    paymentDate: new Date().toISOString(),
  } satisfies Member;
  writeStorage(MEMBER_STORAGE_KEY, members);

  try {
    window.localStorage.removeItem(PENDING_PLAN_STORAGE_KEY);
  } catch {
    // Local storage may be unavailable in private browsing or restricted contexts.
  }
}

export function saveAllocation(
  userId: string,
  allocation: Record<string, number>,
) {
  const members = readMembers();
  const memberIndex = members.findIndex(
    (member) => member.userId === userId,
  );
  if (memberIndex < 0 || !members[memberIndex]) return;

  members[memberIndex] = {
    ...members[memberIndex],
    allocation: { ...allocation },
  };
  writeStorage(MEMBER_STORAGE_KEY, members);
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
