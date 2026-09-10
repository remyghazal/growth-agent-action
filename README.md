# Growth Agent action

The steps [Growth Agent](https://github.com/apps/growth-agent) runs inside your
own CI. Your repository keeps the part that decides what code *can* do — the
job split and the permissions — in the workflow file you commit. This holds
what runs inside those permissions.

## Why it is split this way

**`implement/`** runs the coding model. It checks out your code read-only with
`persist-credentials: false`, installs your dependencies, runs the model, and
writes a patch file. There is no `GITHUB_TOKEN` and no `GH_TOKEN` in this job.
A prompt-injected model has nothing to push with: its only output is a file.

**`apply/`** checks that patch — paths, size, file modes, binaries, dependency
changes — and pushes a branch if it passes. It runs no model and no project
code, and installs only this package, with `--ignore-scripts`.

**`verify/`** checks instrumentation patches in a separate job without write or
model credentials. Workflow version 12 requires this job before apply.

The pull request is opened by the Growth Agent app, not from your Action.
GitHub refuses `gh pr create` from Actions unless a repository setting that
ships *off* has been ticked, and nobody should have to discover that from a
failed run.

## Pinning

Third-party actions used here are pinned to full commit SHAs.

Your workflow pins this action to `@v1`, a major version tag we move for
backward-compatible changes — so a new runner release does not require you to
edit your workflow by hand. This repository is public: watch it if you want to
review each change before it reaches your CI.

## Releasing

Actions and the bundled `runner/` package are staged from our private monorepo
after its release gates pass. No private application source is copied here.
The runner's `release.json` records the source commit and distribution hashes.
The public workflow checks those hashes, package metadata, action version pins,
and an offline runner smoke test. It publishes only on manual dispatch from
`main`, using npm trusted publishing and provenance. Provenance covers this
checked-in distribution and its publication, not a public source rebuild.

Configure the npm trusted publisher for `@growthagent/ci` with GitHub owner
`remyghazal`, repository `growth-agent-action`, workflow
`release-ci-package.yml`, and direct publish permission. No npm token is stored
in GitHub. Publish the package before moving the customer-facing `v1` tag.
