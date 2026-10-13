// Pure business rules for reviewing applicants (no database, unit-tested).

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type SkillCheck = { name: string; has: boolean };

// Which of the post's skills the applicant has, ignoring capitals.
// Shown as green (has it) or red (doesn't) on the applicants page.
export function skillMatch(
  applicantSkills: string[],
  post: { requiredSkills: string[]; niceSkills: string[] },
): { required: SkillCheck[]; nice: SkillCheck[] } {
  const theirs = new Set(applicantSkills.map((s) => s.toLowerCase()));
  const check = (name: string) => ({
    name,
    has: theirs.has(name.toLowerCase()),
  });
  return {
    required: post.requiredSkills.map(check),
    nice: post.niceSkills.map(check),
  };
}

// How many applications there are in each tab.
export function countByStatus(applications: { status: ApplicationStatus }[]) {
  const counts = {
    all: applications.length,
    pending: 0,
    accepted: 0,
    rejected: 0,
  };
  for (const app of applications) counts[app.status] += 1;
  return counts;
}

// The buttons to show for an application: every status except its current one.
export function statusChoices(current: ApplicationStatus): ApplicationStatus[] {
  return (["accepted", "rejected", "pending"] as const).filter(
    (status) => status !== current,
  );
}
