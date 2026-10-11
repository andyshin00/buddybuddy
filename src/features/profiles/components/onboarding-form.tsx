"use client";

import { useActionState } from "react";

import { createProfile, type OnboardingState } from "../actions";

export function OnboardingForm() {
  // useActionState keeps what the Server Action returned (e.g. an error)
  // and tells us while it's still running (`pending`).
  const [state, formAction, pending] = useActionState<
    OnboardingState,
    FormData
  >(createProfile, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="username" className="text-sm font-medium">
        Username
      </label>
      <input
        id="username"
        name="username"
        defaultValue={state.username}
        required
        minLength={3}
        maxLength={20}
        autoComplete="username"
        aria-invalid={state.error ? true : undefined}
        aria-describedby="username-help"
        className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <p
        id="username-help"
        className={
          state.error ? "text-sm text-red-600" : "text-sm text-zinc-500"
        }
      >
        {state.error ??
          "3–20 characters: lowercase letters, numbers or underscores. This is your public name."}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
