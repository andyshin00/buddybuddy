"use client";

import { useActionState } from "react";

import { EXPERIENCE_LEVELS, LINKS, TIMEZONES } from "@/lib/constants";

import { type ProfileFormState, updateProfile } from "../actions";
import type { ProfileFormInput } from "../schemas";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

export function ProfileForm({ initial }: { initial: ProfileFormInput }) {
  const [state, formAction, pending] = useActionState<
    ProfileFormState,
    FormData
  >(updateProfile, {});

  // After an error, show what the user typed rather than the saved values.
  const values = state.values ?? initial;
  const errors = state.fieldErrors ?? {};

  // One labelled text box, with its error message underneath.
  function field(
    name: keyof ProfileFormInput,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) {
    const error = errors[name]?.[0];
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
        <input
          id={name}
          name={name}
          defaultValue={String(values[name] ?? "")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className={inputClass}
          {...props}
        />
        {error && (
          <p id={`${name}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Public profile</legend>
        <p className="text-sm text-zinc-500">
          Any signed-in user can see this.
        </p>
        {field("displayName", "Display name", { maxLength: 50 })}
        {field("headline", "Headline (e.g. “CS junior” or “Backend dev”)", {
          maxLength: 80,
        })}
        <div className="flex flex-col gap-1">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={1000}
            defaultValue={String(values.bio ?? "")}
            className={inputClass}
          />
          {errors.bio && (
            <p className="text-sm text-red-600">{errors.bio[0]}</p>
          )}
        </div>
        {field("skills", "Skills (separated by commas)", {
          placeholder: "React, TypeScript, Figma",
        })}
        <div className="flex flex-col gap-1">
          <label htmlFor="experience" className="text-sm font-medium">
            Experience
          </label>
          <select
            id="experience"
            name="experience"
            defaultValue={String(values.experience ?? "")}
            className={inputClass}
          >
            <option value="">Not set</option>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
        {field("hoursPerWeek", "Hours per week you can give", {
          type: "number",
          min: 1,
          max: 168,
        })}
        <div className="flex flex-col gap-1">
          <label htmlFor="timezone" className="text-sm font-medium">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={String(values.timezone ?? "")}
            className={inputClass}
          >
            <option value="">Not set</option>
            {TIMEZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Private details</legend>
        <p className="text-sm text-zinc-500">
          Only shown to people you collaborate with, except links you mark
          public.
        </p>
        {field("realName", "Real name", { maxLength: 80 })}
        {LINKS.map((link) => {
          const publicName = `${link.key}Public` as const;
          return (
            <div key={link.key} className="flex flex-col gap-2">
              {field(`${link.key}Url`, `${link.label} link`, {
                type: "url",
                placeholder: "https://…",
              })}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={publicName}
                  defaultChecked={Boolean(values[publicName])}
                />
                Show my {link.label} link to everyone
              </label>
            </div>
          );
        })}
        {field("email", "Contact email", { type: "email" })}
        {field("discord", "Discord", { maxLength: 40 })}
      </fieldset>

      {hasErrors && (
        <p role="alert" className="text-sm text-red-600">
          Please fix the highlighted fields.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
