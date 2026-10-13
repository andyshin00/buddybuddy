"use client";

import { useActionState } from "react";

import { deleteAccount, type DeleteAccountState } from "../actions";

export function DeleteAccountForm({ word }: { word: string }) {
  const [state, formAction, pending] = useActionState<
    DeleteAccountState,
    FormData
  >(deleteAccount, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="confirm" className="text-sm font-medium">
        Type <strong>{word}</strong> to confirm
      </label>
      <input
        id="confirm"
        name="confirm"
        required
        autoComplete="off"
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "confirm-error" : undefined}
        className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {state.error && (
        <p id="confirm-error" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete my account"}
      </button>
    </form>
  );
}
