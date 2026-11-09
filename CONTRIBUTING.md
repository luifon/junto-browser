# Contributing

## The flow

1. Discuss a larger change in an issue first, so that the design fits `docs/adr/0001-the-extension-is-a-share-source-of-the-client.md` and `docs/plan.md`.
2. Work on a branch and open a pull request to `main`. Nobody pushes to `main` directly.
3. The checks below must pass on the head commit of the pull request.
4. The contributor licence agreement check (`license/cla`) must pass: the first pull request of each person asks for the signature (below).
5. The maintainer reviews and merges. A merge is a merge commit.

## Contributor licence agreement

This repository uses the contributor licence agreement of Junto. The agreement covers more than one project of the same company, and this is one of them:

- Individual: <https://github.com/luifon/junto/blob/main/docs/legal/cla-individual.md>
- Entity: <https://github.com/luifon/junto/blob/main/docs/legal/cla-entity.md>

CLA assistant (<https://cla-assistant.io>) asks for the signature on the first pull request. "Work that you did not write" and the other details are in the section "Contributor licence agreement" of <https://github.com/luifon/junto/blob/main/CONTRIBUTING.md>.

## Checks

```sh
npm ci
npm run check
npm test
npm run build
python3 -m unittest discover -s tools/mock-host -p "test_*.py"
```

The workflow `.github/workflows/ci.yml` runs the same commands on each pull request.

## Rules

- Every package version is pinned to one exact version, and `package-lock.json` is committed. Every GitHub action is named by its commit hash.
- A new dependency is a decision: say why in the pull request. Its licence must allow use in an Apache-2.0 project, and its origin must be clear.
- Each engineering decision is an ADR in `docs/adr/` (the next free number), with its technical reasons only.
- No personal information in a tracked file: no names, e-mail addresses, host names or account identifiers. Examples and test data use invented values.
- Comments are kept to a minimum. Write plain, literal English in code, documents and commit messages.
- The extension asks for no permission that `docs/adr/` does not justify.
