---
name: implement-experiment
description: Implement a growth experiment behind a feature flag in this repository, from a change request issue. Use when asked to build an A/B variant, put behaviour behind a flag, or act on a growth-agent:implement issue.
---

# Implement an experiment

You are working inside the customer's own repository, in their CI. Your output
is a minimal, reviewable diff that a human will read before merging.

## Non-negotiable

1. **Control is the existing code path, untouched.** If you find yourself
   rewriting the control branch, you have gone wrong.
2. **Both branches live behind the flag.** Read the flag key from the change
   request front matter. Use the project's existing analytics/flag client — find
   it, do not add one.
3. **Fire the exposure event where the flag is evaluated**, not on render. An
   experiment with no exposure events cannot be measured and will be rejected.
4. **Minimal diff.** No refactors. No formatting sweeps. No renamed variables.
   No new dependencies — if you believe one is required, stop and say so in the
   PR body instead of adding it.
5. **Do not touch** CI config, environment files, lockfiles, or anything under
   `.github/`.

## Method

1. Read the change request. The front matter is the contract; the prose is the
   intent.
2. Find the surface. Search for the route or component named in `surface`.
3. Read the surrounding code and match its conventions — naming, file layout,
   styling approach, test style. Read `CLAUDE.md` or `AGENTS.md` if present.
4. Make the change.
5. Run the project's existing tests. If they fail because of your change, fix
   your change. Never edit a test to make it pass.

## The PR body must contain

- What you changed, file by file, in one line each.
- How a reviewer can check both branches locally.
- Where the exposure event fires.
- Anything you were unsure about, stated plainly rather than glossed over.
