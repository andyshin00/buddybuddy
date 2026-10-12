"use client";

import { useActionState } from "react";

import { DURATIONS, LINKS, POST_TYPES, TIMEZONES } from "@/lib/constants";

import type { PostFormState } from "../actions";
import type { PostFormInput } from "../schemas";
import { QuestionEditor } from "./question-editor";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

// Used for both "New post" and "Edit post"; the page passes the right action.
export function PostForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
  initial: PostFormInput;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values ?? initial;
  const errors = state.fieldErrors ?? {};

  function error(name: keyof PostFormInput) {
    const message = errors[name]?.[0];
    return message ? (
      <p id={`${name}-error`} className="text-sm text-red-600">
        {message}
      </p>
    ) : null;
  }

  // Props that connect a field to its error message (for screen readers).
  function describedBy(name: keyof PostFormInput) {
    return errors[name]
      ? { "aria-invalid": true, "aria-describedby": `${name}-error` }
      : {};
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={100}
          defaultValue={String(values.title ?? "")}
          className={inputClass}
          {...describedBy("title")}
        />
        {error("title")}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          maxLength={3000}
          defaultValue={String(values.description ?? "")}
          className={inputClass}
          {...describedBy("description")}
        />
        {error("description")}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Post type</legend>
        {POST_TYPES.map((t) => (
          <label key={t.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="type"
              value={t.value}
              defaultChecked={values.type === t.value}
            />
            {t.label}
          </label>
        ))}
        {error("type")}
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="roles" className="text-sm font-medium">
          Roles needed (separated by commas)
        </label>
        <input
          id="roles"
          name="roles"
          required
          placeholder="Frontend, Backend, Designer"
          defaultValue={String(values.roles ?? "")}
          className={inputClass}
          {...describedBy("roles")}
        />
        {error("roles")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="requiredSkills" className="text-sm font-medium">
            Required skills
          </label>
          <input
            id="requiredSkills"
            name="requiredSkills"
            placeholder="React, TypeScript"
            defaultValue={String(values.requiredSkills ?? "")}
            className={inputClass}
            {...describedBy("requiredSkills")}
          />
          {error("requiredSkills")}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="niceSkills" className="text-sm font-medium">
            Nice-to-have skills
          </label>
          <input
            id="niceSkills"
            name="niceSkills"
            placeholder="Figma"
            defaultValue={String(values.niceSkills ?? "")}
            className={inputClass}
            {...describedBy("niceSkills")}
          />
          {error("niceSkills")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="hoursPerWeek" className="text-sm font-medium">
            Hours per week
          </label>
          <input
            id="hoursPerWeek"
            name="hoursPerWeek"
            type="number"
            required
            min={1}
            max={168}
            defaultValue={String(values.hoursPerWeek ?? "")}
            className={inputClass}
            {...describedBy("hoursPerWeek")}
          />
          {error("hoursPerWeek")}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="duration" className="text-sm font-medium">
            Expected duration
          </label>
          <select
            id="duration"
            name="duration"
            defaultValue={String(values.duration ?? "")}
            className={inputClass}
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          {error("duration")}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="timezone" className="text-sm font-medium">
            Timezone preference
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={String(values.timezone ?? "")}
            className={inputClass}
          >
            <option value="">No preference</option>
            {TIMEZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">
          Applicants must have these links on their profile
        </legend>
        {LINKS.map((link) => (
          <label key={link.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="requiredLinks"
              value={link.key}
              defaultChecked={values.requiredLinks?.includes(link.key)}
            />
            {link.label}
          </label>
        ))}
      </fieldset>

      <QuestionEditor
        initial={String(values.questions ?? "[]")}
        errors={errors.questions}
      />

      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm text-red-600">
          Please fix the highlighted fields.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
