"use client";

import { useRef, useState } from "react";

import { hasOptions, QUESTION_TYPES, type QuestionType } from "@/lib/constants";

import { MAX_QUESTIONS } from "../schemas";
import { QUESTION_TEMPLATES, type QuestionDraft } from "../templates";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
const smallButton =
  "rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800";

// Each question gets a `key` so React can tell them apart when they move.
type EditorQuestion = QuestionDraft & { key: number };

function parseInitial(json: string): EditorQuestion[] {
  try {
    const list = JSON.parse(json) as QuestionDraft[];
    return Array.isArray(list) ? list.map((q, i) => ({ ...q, key: i })) : [];
  } catch {
    return [];
  }
}

// The application-form builder. All editing happens here in the browser;
// the finished list is sent with the post form as one hidden JSON field.
export function QuestionEditor({
  initial,
  errors,
}: {
  initial: string; // JSON list of questions
  errors?: string[];
}) {
  const [questions, setQuestions] = useState(() => parseInitial(initial));
  // Keys for new questions continue after the initial ones (0, 1, 2…), so the
  // server and the browser render the same ids.
  const nextKey = useRef(questions.length);
  const withKey = (q: QuestionDraft): EditorQuestion => ({
    ...q,
    key: nextKey.current++,
  });
  const [templateId, setTemplateId] = useState(QUESTION_TEMPLATES[0].id);
  const full = questions.length >= MAX_QUESTIONS;

  function update(key: number, changes: Partial<QuestionDraft>) {
    setQuestions((list) =>
      list.map((q) => (q.key === key ? { ...q, ...changes } : q)),
    );
  }

  function move(index: number, by: -1 | 1) {
    setQuestions((list) => {
      const copy = [...list];
      [copy[index], copy[index + by]] = [copy[index + by], copy[index]];
      return copy;
    });
  }

  function remove(key: number) {
    setQuestions((list) => list.filter((q) => q.key !== key));
  }

  function add() {
    const blank = withKey({
      type: "short",
      label: "",
      required: false,
      options: [],
    });
    setQuestions((list) => [...list, blank]);
  }

  function insertTemplate() {
    const template = QUESTION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const added = template.questions.map(withKey);
    setQuestions((list) => [...list, ...added].slice(0, MAX_QUESTIONS));
  }

  // What gets submitted: the questions without their React keys.
  const submitted = JSON.stringify(
    questions.map(({ type, label, required, options }) => ({
      type,
      label,
      required,
      options,
    })),
  );

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-sm font-medium">
        Application questions
      </legend>
      <p className="text-sm text-zinc-500">
        Optional. Applicants answer these when they apply. Start from a template
        or add your own.
      </p>
      <input type="hidden" name="questions" value={submitted} />

      {questions.length === 0 && (
        <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No questions yet.
        </p>
      )}

      <ol className="flex flex-col gap-4">
        {questions.map((q, index) => {
          const id = `question-${q.key}`;
          return (
            <li
              key={q.key}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Question {index + 1}
                </span>
                <div className="ml-auto flex gap-1">
                  <button
                    type="button"
                    className={smallButton}
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move question ${index + 1} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={smallButton}
                    onClick={() => move(index, 1)}
                    disabled={index === questions.length - 1}
                    aria-label={`Move question ${index + 1} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={smallButton}
                    onClick={() => remove(q.key)}
                    aria-label={`Remove question ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={`${id}-label`} className="text-sm">
                  Question
                </label>
                <input
                  id={`${id}-label`}
                  value={q.label}
                  maxLength={200}
                  onChange={(e) => update(q.key, { label: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${id}-type`} className="text-sm">
                    Answer type
                  </label>
                  <select
                    id={`${id}-type`}
                    value={q.type}
                    onChange={(e) =>
                      update(q.key, { type: e.target.value as QuestionType })
                    }
                    className={inputClass}
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) =>
                      update(q.key, { required: e.target.checked })
                    }
                  />
                  Required
                </label>
              </div>

              {hasOptions(q.type) && (
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${id}-options`} className="text-sm">
                    Choices, one per line
                  </label>
                  <textarea
                    id={`${id}-options`}
                    rows={4}
                    value={q.options.join("\n")}
                    onChange={(e) =>
                      update(q.key, { options: e.target.value.split("\n") })
                    }
                    className={inputClass}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {errors && errors.length > 0 && (
        <ul
          id="questions-error"
          className="flex flex-col gap-1 text-sm text-red-600"
        >
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={smallButton}
          onClick={add}
          disabled={full}
        >
          + Add question
        </button>
        <span className="text-sm text-zinc-500">or</span>
        <label htmlFor="template" className="sr-only">
          Template
        </label>
        <select
          id="template"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {QUESTION_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}: {t.description}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={smallButton}
          onClick={insertTemplate}
          disabled={full}
        >
          Insert template
        </button>
      </div>
      {full && (
        <p className="text-sm text-zinc-500">
          That&apos;s the maximum of {MAX_QUESTIONS} questions.
        </p>
      )}
    </fieldset>
  );
}
