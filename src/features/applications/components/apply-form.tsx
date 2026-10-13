"use client";

import { useActionState } from "react";

import type { ApplyFormState } from "../actions";
import { type ApplyQuestion, YES_NO } from "../schemas";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

// The apply form. Its fields come from the post: one per question, with the
// right kind of input for each question type.
export function ApplyForm({
  action,
  roles,
  questions,
}: {
  action: (
    state: ApplyFormState,
    formData: FormData,
  ) => Promise<ApplyFormState>;
  roles: { id: string; name: string }[]; // open roles only
  questions: ApplyQuestion[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  // After an error, show what was entered before.
  const text = (name: string) => {
    const value = values[name];
    return typeof value === "string" ? value : "";
  };
  const list = (name: string) => {
    const value = values[name];
    return Array.isArray(value) ? value : [];
  };

  function error(name: string) {
    const message = errors[name]?.[0];
    return message ? (
      <p id={`${name}-error`} className="text-sm text-red-600">
        {message}
      </p>
    ) : null;
  }
  const describedBy = (name: string) =>
    errors[name]
      ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` }
      : {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.formError && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.formError}
        </p>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-medium">
          Which role are you applying for?
        </legend>
        {roles.map((role) => (
          <label key={role.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="roleId"
              value={role.id}
              required
              defaultChecked={
                values.roleId ? values.roleId === role.id : roles.length === 1
              }
            />
            {role.name}
          </label>
        ))}
        {error("roleId")}
      </fieldset>

      {questions.map((q, index) => {
        const label = (
          <>
            {index + 1}. {q.label}
            {q.required && <span className="text-red-600"> *</span>}
          </>
        );

        if (q.type === "short" || q.type === "long") {
          const Field = q.type === "short" ? "input" : "textarea";
          return (
            <div key={q.id} className="flex flex-col gap-1">
              <label htmlFor={q.id} className="font-medium">
                {label}
              </label>
              <Field
                id={q.id}
                name={q.id}
                required={q.required}
                maxLength={q.type === "short" ? 200 : 3000}
                rows={q.type === "long" ? 5 : undefined}
                defaultValue={text(q.id)}
                className={inputClass}
                {...describedBy(q.id)}
              />
              {error(q.id)}
            </div>
          );
        }

        if (q.type === "dropdown") {
          return (
            <div key={q.id} className="flex flex-col gap-1">
              <label htmlFor={q.id} className="font-medium">
                {label}
              </label>
              <select
                id={q.id}
                name={q.id}
                required={q.required}
                defaultValue={text(q.id)}
                className={inputClass}
                {...describedBy(q.id)}
              >
                <option value="">Choose…</option>
                {q.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {error(q.id)}
            </div>
          );
        }

        // "multi" (checkboxes) and "yesno" (two radio buttons)
        const choices = q.type === "yesno" ? [...YES_NO] : q.options;
        return (
          <fieldset
            key={q.id}
            className="flex flex-col gap-1"
            {...describedBy(q.id)}
          >
            <legend className="mb-1 font-medium">{label}</legend>
            {choices.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type={q.type === "multi" ? "checkbox" : "radio"}
                  name={q.id}
                  value={option}
                  required={q.type === "yesno" && q.required}
                  defaultChecked={
                    q.type === "multi"
                      ? list(q.id).includes(option)
                      : text(q.id) === option
                  }
                />
                {option}
              </label>
            ))}
            {error(q.id)}
          </fieldset>
        );
      })}

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="font-medium">
          Message to the poster (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={1000}
          defaultValue={text("message")}
          className={inputClass}
          {...describedBy("message")}
        />
        {error("message")}
      </div>

      <p className="text-sm text-zinc-500">
        The poster will see your profile (skills, experience, availability) and
        all your profile links, even private ones. They see your contact details
        only if they accept you.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Sending…" : "Send application"}
      </button>
    </form>
  );
}
