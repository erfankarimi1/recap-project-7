---
name: tdd-feature
description: Implement an approved plan with strict test-driven development, one acceptance criterion at a time. Does nothing that is not in the plan.
argument-hint: <path to plan file>
disable-model-invocation: true
---

You are implementing an approved plan for the Todo App. The plan file is: $ARGUMENTS

## Before you start
1. Read the plan file completely. Read `CLAUDE.md`, especially the Commands section.
2. Check you are on a `feature/...` branch, not `main`. If not, stop and tell me.
3. List the acceptance criteria from the plan in order. This is your work queue.

## For each acceptance criterion, in order
Work on ONE criterion at a time. Do not start the next one until the current one is finished.

1. **Red**: write the failing test described in the plan for this criterion.
2. **Run it once.** Run only this test.
3. **Check it fails for the right reason.** Read the failure message. It must fail because the behavior is missing, not because of a typo, a bad import, a syntax error or a wrong setup. If it fails for the wrong reason, fix the test and run again. Tell me what the failure message was.
4. **Green**: write the minimal code that makes the test pass. No extra features, no "while I'm here" improvements.
5. **Run the test again** and repeat until it passes. Then run the whole test suite to make sure nothing broke.
6. **Refactor**: clean up the code and the test (naming, duplication) without changing behavior. Run the tests again.
7. Report in one or two lines: criterion done, test name, result. Then move on to the next one.

## Rules
- Never change an existing test unless the approved plan explicitly says so. If an existing test fails because of your change, stop and ask me.
- Do nothing that is not in the plan: no extra files, no extra refactoring, no dependency changes, no scope creep. If you think something is missing from the plan, stop and ask me.
- Do not commit and do not push. That is the job of `/open-pr`.
- Never skip the "fails for the right reason" check.

## At the end
Run ALL checks listed in the Commands section of `CLAUDE.md` (tests, lint, type check, build, whatever is listed). Report each command and its real result. If something fails, fix it only if the fix is within the plan; otherwise tell me.

Finish with a short summary: criteria completed, files changed, check results, and anything you left undone or are unsure about.