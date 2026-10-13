"use client";

import { useActionState, useId } from "react";

import { REPORT_REASONS } from "@/lib/constants";

import type { ReportFormState } from "../actions";

const inputClass =
  "rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

// "Report" link that opens a small form. `action` is submitReport, already
// bound to what's being reported (a user or a post).
export function ReportForm({
  action,
  label,
}: {
  action: (
    state: ReportFormState,
    formData: FormData,
  ) => Promise<ReportFormState>;
  label: string; // e.g. "Report this post"
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const id = useId(); // unique ids, in case two forms are on one page

  if (state.sent) {
    return (
      <p role="status" className="text-sm text-zinc-500">
        Thanks for the report. We’ll take a look.
      </p>
    );
  }

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-zinc-500 hover:underline">
        {label}
      </summary>
      <form
        action={formAction}
        className="mt-3 flex max-w-md flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
      >
        {state.formError && (
          <p role="alert" className="text-red-600">
            {state.formError}
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-reason`} className="font-medium">
            Reason
          </label>
          <select
            id={`${id}-reason`}
            name="reason"
            required
            defaultValue=""
            className={inputClass}
            aria-invalid={state.fieldErrors?.reason ? true : undefined}
            aria-describedby={
              state.fieldErrors?.reason ? `${id}-reason-error` : undefined
            }
          >
            <option value="" disabled>
              Choose a reason
            </option>
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.reason && (
            <p id={`${id}-reason-error`} className="text-red-600">
              {state.fieldErrors.reason[0]}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-details`} className="font-medium">
            Details{" "}
            <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <textarea
            id={`${id}-details`}
            name="details"
            rows={3}
            maxLength={1000}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Sending…" : "Send report"}
        </button>
      </form>
    </details>
  );
}
