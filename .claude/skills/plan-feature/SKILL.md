---
name: plan-feature
description: Read a GitHub issue, explore the relevant code, and produce an implementation plan for approval. Creates the feature branch and commits the plan file after approval. Writes no application code.
argument-hint: <issue number>
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(gh issue view:*), Bash(git status:*), Bash(git checkout -b:*), Bash(git add docs/plans/*), Bash(git commit:*), Write(docs/plans/*)
---

You are planning work for the Todo App. The issue number is: $ARGUMENTS

Use only the number of the issue (for example `6`), even if I typed "issue 6" or "#6". Use that bare number in `gh issue view`, the branch name, the plan file name and the commit message. Never put the word "issue" or a space into a branch or file name.

This skill should run in Plan mode. If it is not, tell me to switch to Plan mode (Shift+Tab) and stop.

## Phase 1: Understand (read-only)
1. Run `gh issue view $ARGUMENTS` and read the whole issue: value proposition, acceptance criteria, tasks.
2. Read `CLAUDE.md` for the project conventions and the Commands section.
3. Explore only the code that matters for this issue: the relevant modules, the existing tests next to them, and similar features already in the codebase. Do not read the whole repo.

## Phase 2: Present the plan
Show me a plan in this structure:

1. **Summary**: what the issue wants, in 2-3 sentences.
2. **Acceptance criteria to tests**: a table with one row per criterion: criterion | test (file and test name) | what the test asserts.
3. **Files that change**: each file, with one line on why. Mark each as new or modified.
4. **Out of scope**: what this issue does NOT include, so it is not built by accident.
5. **Open questions**: anything unclear or ambiguous in the issue. Do not guess; ask.

Rules for this phase:
- Do NOT write or edit any application code or test code.
- Do NOT create the branch or any file yet.
- End by asking: "Do you approve this plan?" and wait.

## Phase 3: After I approve
Only after I explicitly approve, do exactly these three things, in this order, and then stop:

1. Create the branch: `git checkout -b feature/$ARGUMENTS-<slug>`. The slug is the issue title in lowercase kebab-case, max 5 words.
2. Save the approved plan (including any changes I asked for) as `docs/plans/$ARGUMENTS-<slug>.md`.
3. Commit only that file: `docs: add plan for issue #$ARGUMENTS`.

Then stop. Do not push. Do not start implementing. Tell me the branch name and the plan file path, and that the next step is `/tdd-feature docs/plans/$ARGUMENTS-<slug>.md`.

If I ask for changes instead of approving, update the plan and ask again.

Save the plan file in `docs/plans/` with a name that includes the issue number and a short slug of the title. For example, if the issue is #42 and the title is "Add search filter for todos", the plan file could be `docs/plans/42-add-search-filter.md`.

## One plan file per issue
- Every issue gets its own NEW plan file. Never edit, rename, overwrite or reuse the plan file of another issue, not even to "update" it into the new plan.
- Do not touch existing files in `docs/plans/`. If the target file for this issue already exists, stop and ask me.
- Each plan is committed alone, on the branch of its own issue. A plan file from another issue must not appear in the commit.