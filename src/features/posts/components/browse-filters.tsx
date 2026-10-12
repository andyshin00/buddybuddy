import Link from "next/link";

import { DURATIONS, POST_TYPES } from "@/lib/constants";

import type { BrowseFilters as Filters } from "../schemas";

const inputClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

// A plain GET form: submitting it changes the URL (?search=…&type=…), and the
// page reads its filters from the URL. So a filtered list can be bookmarked
// or shared, and it works without JavaScript.
export function BrowseFilters({ filters }: { filters: Filters }) {
  return (
    <form
      method="GET"
      action="/"
      role="search"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-3">
        Search
        <input
          name="search"
          type="search"
          defaultValue={filters.search}
          placeholder="Title or description"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Type
        <select
          name="type"
          defaultValue={filters.type ?? ""}
          className={inputClass}
        >
          <option value="">Any</option>
          {POST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Duration
        <select
          name="duration"
          defaultValue={filters.duration ?? ""}
          className={inputClass}
        >
          <option value="">Any</option>
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Max hours/week
        <input
          name="maxHours"
          type="number"
          min={1}
          max={168}
          defaultValue={filters.maxHours ?? ""}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-3">
        Skills (any of, separated by commas)
        <input
          name="skills"
          defaultValue={filters.skills.join(", ")}
          placeholder="React, Python"
          className={inputClass}
        />
      </label>
      <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Apply filters
        </button>
        <Link
          href="/"
          className="px-2 py-2 text-sm text-zinc-500 hover:underline"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}
