---
name: open-pr
description: Verify the branch, run all checks, commit in small steps, push, and open a pull request with gh. Claims nothing that was not checked.
argument-hint: <issue number>
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git branch:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(gh issue view:*), Bash(gh pr create:*), Bash(npm:*)
---

You are opening a pull request for issue #$ARGUMENTS of the Todo App.

## Step 1: Safety check
Run `git branch --show-current`. If the branch is `main`, STOP immediately and tell me. Never commit to or push `main`.

## Step 2: Gather facts
1. Run `gh issue view $ARGUMENTS` to get the acceptance criteria.
2. Find the plan in `docs/plans/$ARGUMENTS-*.md`.
3. Run `git status` and `git diff main...HEAD` to see what changed.

## Step 3: Run all checks
Run every command in the Commands section of `CLAUDE.md`. Record each command and its actual result (pass/fail, number of tests). If any check fails, STOP and report. Do not commit or open a PR with failing checks.

## Step 4: Commit in small steps
- Group uncommitted changes into small, logical commits (for example: one per acceptance criterion, tests together with their code).
- Use clear messages in the imperative: `Add search filter for todos`. Reference the issue where useful (`#$ARGUMENTS`).
- Do not commit unrelated files, secrets, or build output.

## Step 5: Push
`git push -u origin <current branch>`. Never force-push.

## Step 6: Create the PR
Use `gh pr create` with a clear title and a body in exactly this structure:

    Closes #$ARGUMENTS

    ## Summary
    <2-4 sentences: what changed and why>

    ## How I tested
    <the exact commands I ran in Step 3 and their real results>

    ## Acceptance criteria
    - [x] <criterion that I verified, naming the test that proves it>
    - [ ] <criterion not verified, with a short reason>

## Honesty rules
- Claim nothing you did not check. Only tick a criterion if a test you actually ran covers it.
- Do not write "all tests pass" unless you ran them in this session and they passed.
- If something could not be tested (for example manual UI behavior), say so under "How I tested" and leave the box unchecked.

Finish by giving me the PR URL and a note that the reviewer can run now.