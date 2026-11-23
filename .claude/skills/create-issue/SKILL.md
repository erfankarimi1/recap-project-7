---
name: create-issue
description: Turn an idea into a GitHub issue in the project's template format (value proposition, acceptance criteria, tasks). Shows a draft first and only creates the issue after approval.
argument-hint: <your idea>
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write(docs/issues/*), Bash(gh issue view:*), Bash(gh issue list:*), Bash(gh issue create:*)
---

You are writing a GitHub issue for the Todo App from this idea: $ARGUMENTS

## Step 1: Learn the format
Look for an issue template in `.github/ISSUE_TEMPLATE/`. If there is none, run `gh issue list` and read one or two existing issues with `gh issue view <n>`. Copy their structure, headings and tone exactly.

## Step 2: Draft the issue
Write a draft with:
- **Title**: short, specific, imperative.
- **Value proposition**: who benefits and why, in 1-3 sentences (for example "As a user, I want ... so that ...").
- **Acceptance criteria**: a checklist of concrete, testable statements. Each one must be verifiable by a single test. No vague words like "nice" or "fast".
- **Tasks**: a checklist of the implementation steps.

Keep the issue small enough for one pull request. If the idea is too big, say so and suggest splitting it.

## Step 3: Show the draft and wait
Show me the full draft. Ask: "Shall I create this issue?" List any assumptions or open questions. Do NOT run `gh issue create` yet.

If I ask for changes, revise the draft and show it again.

## Step 4: Create
Only after I clearly agree, run `gh issue create` with the approved title and body. Then give me the issue number and URL, and say the next step is `/plan-feature <number>`.

## Step 5: Save the issue file
Create an issue file in the `docs/issues/` folder with the issue number and a short slug of the title. For example, if the issue is #[] and the title is "Add search filter for todos", the issue file could be `docs/issues/#[]-add-search-filter.md`.