# Claude Code collaboration playbook

## Default development loop
1. **Orient:** Git status, current branch, `docs/CURRENT_STATE.md`, next `BB-###`.
2. **Specify:** Problem, user story, non-goals, acceptance criteria and 2-account security edge cases.
3. **Choose ownership:** tutor (you implement), pair (you implement core with guidance), delegate (Claude implements bounded work).
4. **Plan before complex work:** ask for files to change, data schema/API, risks, tests, and alternatives. Approve before edits.
5. **Implement in a feature branch:** preferably one user-visible vertical slice, not all UI then all backend.
6. **Verify:** tests, `tsc --noEmit` when configured, lint, build, local UI; check negative permissions.
7. **Teach back:** human explains input → validation → permission → database → response. Claude asks 2-3 targeted comprehension questions.
8. **Record:** update current state/backlog; decision log only if approved; review diff; commit intentionally.

## Delegation rubric
**Tutor:** database modeling, auth/authorization, transactions, AI evaluation when first encountered. Ask for hints, examples and tests, not complete implementation.
**Pair:** new endpoint, message permission flow, invitation state transitions, implementing a new UI from agreed Figma/mockup.
**Delegate:** consistent UI components, form layouts, boilerplate, tests for already-understood logic, migration templates after design approval, repetitive refactors, docs cleanup.
**Keep human approval:** security policies, schema architecture, package dependencies, AI data/privacy policy, production deploy, destructive changes, pricing and core UX decisions.

## Avoid token/context waste
- One task per session; prefer a fresh session when changing domains.
- Resume same unfinished task with `claude --continue` / `--resume` where supported.
- Use `/compact` in long sessions, `/clear` between unrelated tasks; keep files up to date even when resuming.
- Ask for specific files/paths and a concise report, not giant code dumps.
- Don't ask Claude to re-read every doc every turn; read only relevant pages after first orient.
- Only add custom skills/subagents/hooks after a repeated need, not before the first vertical slice.

## Git workflow
- `main`: working baseline.
- `feature/bb-###-short-name`: one bounded feature.
- Inspect `git diff` and run checks before merge/commit.
- Git checkpoints are separate from Claude session checkpoints; do not rely on session history as backup.

## Prompt examples
**Planning:** "Plan BB-008 only. Read PRODUCT, ARCHITECTURE and relevant files. Compare 2 designs, list tradeoffs, tests, and exact changes. No edits until approved."
**Implementing:** "Delegate BB-006. Follow accepted plan. Implement only filtering/pagination. Run typecheck, lint, and relevant tests. Show diff summary and manual QA."
**Reviewing:** "Act as skeptical code reviewer. Find authorization bugs, data leaks, missing negative tests, complexity, and violations of product scope. Don't edit yet."
**Teaching:** "Trace POST /introductions from browser event to DB insert, explain why each authorization check matters, then ask me to predict 3 failure cases."
**Session-end:** "Check git status, verify task, update CURRENT_STATE and BACKLOG with facts, summarize files/tests/risks, and propose next task."

## Why not automate everything?
Automation can hide bugs and prevent learning. Start with default/manual permissions, small reviewed diffs and deterministic checks. Consider custom hooks, CI automation, and specialized subagents when you repeatedly perform the same safe steps.
