import Link from "next/link";

import { StatusBadge } from "@/features/applications/components/status-badge";
import { timeAgo } from "@/features/posts/components/time-ago";
import { EXPERIENCE_LEVELS, LINKS } from "@/lib/constants";

import { setApplicationStatus } from "../actions";
import type { Applicant } from "../queries";
import { type SkillCheck, statusChoices } from "../rules";

const BUTTON_LABELS = {
  accepted: "Accept",
  rejected: "Reject",
  pending: "Move back to pending",
};

const buttonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900";

// Green with ✓ if they have the skill, red with ✗ if not. The symbol is
// there so the meaning doesn't depend on seeing colour.
function SkillChips({
  title,
  skills,
}: {
  title: string;
  skills: SkillCheck[];
}) {
  if (skills.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-zinc-500">{title}:</span>
      {skills.map((s) => (
        <span
          key={s.name}
          className={`rounded-full px-2 py-0.5 ring-1 ${
            s.has
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-red-50 text-red-700 ring-red-200"
          }`}
        >
          {s.has ? "✓" : "✗"} {s.name}
        </span>
      ))}
    </div>
  );
}

// One applicant on the applicants page. `role` is the role they applied
// for, if the post still has it (to offer "mark filled" on accept).
export function ApplicantCard({
  applicant,
  role,
}: {
  applicant: Applicant;
  role: { name: string; filled: boolean } | undefined;
}) {
  const { details } = applicant;
  const name = applicant.displayName ?? applicant.username;
  const experience = EXPERIENCE_LEVELS.find(
    (level) => level.value === applicant.experience,
  )?.label;
  const links = LINKS.filter((link) => details.links[link.key]);
  const hasContact = details.realName || details.email || details.discord;

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <header className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${applicant.username}`}
            className="font-medium hover:underline"
          >
            {name}
          </Link>{" "}
          <span className="text-sm text-zinc-500">@{applicant.username}</span>
          <p className="text-sm text-zinc-500">
            Applied for{" "}
            <span className="text-current">{applicant.roleName}</span> ·{" "}
            {timeAgo(applicant.createdAt)}
          </p>
        </div>
        <StatusBadge status={applicant.status} />
      </header>

      <p className="text-sm">
        {experience ?? "Experience not set"} ·{" "}
        {applicant.hoursPerWeek
          ? `${applicant.hoursPerWeek} hrs/week`
          : "Hours not set"}
        {applicant.timezone && ` · ${applicant.timezone}`}
      </p>

      <div className="flex flex-col gap-1.5">
        <SkillChips title="Required" skills={applicant.match.required} />
        <SkillChips title="Nice to have" skills={applicant.match.nice} />
      </div>

      {links.length > 0 && (
        <p className="flex flex-wrap gap-3 text-sm">
          {links.map((link) => (
            <a
              key={link.key}
              href={details.links[link.key]}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {link.label}
            </a>
          ))}
        </p>
      )}

      {/* Only filled in for ACCEPTED applicants: the server leaves these
          fields out for everyone else, so they never reach the browser. */}
      {applicant.status === "accepted" && (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          <p className="font-medium">Contact</p>
          {hasContact ? (
            <ul>
              {details.realName && <li>{details.realName}</li>}
              {details.email && <li>Email: {details.email}</li>}
              {details.discord && <li>Discord: {details.discord}</li>}
            </ul>
          ) : (
            <p>They haven&apos;t added contact details yet.</p>
          )}
        </div>
      )}

      {applicant.answers.length > 0 && (
        <dl className="flex flex-col gap-2 text-sm">
          {applicant.answers.map((answer) => (
            <div key={answer.questionId}>
              <dt className="text-zinc-500">{answer.label}</dt>
              <dd className="whitespace-pre-line">
                {Array.isArray(answer.value)
                  ? answer.value.join(", ")
                  : answer.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {applicant.message && (
        <blockquote className="border-l-2 border-zinc-300 pl-3 text-sm whitespace-pre-line dark:border-zinc-700">
          {applicant.message}
        </blockquote>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {statusChoices(applicant.status).map((status) => (
          <form
            key={status}
            action={setApplicationStatus.bind(null, applicant.id, status)}
            className="flex items-center gap-3"
          >
            <button type="submit" className={buttonClass}>
              {BUTTON_LABELS[status]}
            </button>
            {status === "accepted" && role && !role.filled && (
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="fillRole" />
                Also mark {role.name} as filled
              </label>
            )}
          </form>
        ))}
      </div>
    </li>
  );
}
