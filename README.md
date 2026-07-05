# Introduction

*&lt;INTRO TEXT&gt;*

## Table of Contents

1. [Quick Start](#quick-start)
2. [Documentation](#documentation)
3. [DevOps](#devops)
    1. [Change Management](#change-management)
    2. [Registry](#registry)
    3. [CI/CD Workflows](#cicd-workflows)

# Quick Start

*&lt;QUICK START INSTRUCTIONS&gt;*

# Documentation

*&lt;DOCUMENTATION&gt;*

# DevOps

```bash
npm install
npm update

npm run clean
npm run build
npm run tests

npm run dev
```

```bash
git fetch upstream
git fetch origin
git fetch . upstream/main:origin/main
git fetch . origin/main:main
git push origin main
git merge --ff-only main
git push
```

## Change Management

1. Create a new branch for the change.
2. Make the changes and commit.
3. Bump the version in [`package.json`](package.json).
4. Add an entry for the new version in [`CHANGELOG.md`](CHANGELOG.md).
5. Pull-request the branch.
6. Ensure package artifacts are current.
7. Publish.

## Registry

`.npmrc`:

```ini
@vode-app:registry=https://git.chimps.quest/api/packages/vode-app/npm/
//git.chimps.quest/api/packages/vode-app/npm/:_authToken=${VODE_APP_REGISTRY_AUTH_TOKEN}
```

or `bunfig.toml`:

```toml
[install.scopes]
"vode-app" = { url = "https://git.chimps.quest/api/packages/vode-app/npm/", token = "$VODE_APP_REGISTRY_AUTH_TOKEN" }
```

```bash
# git.chimps.quest/api/packages/vode-app/npm/
export VODE_APP_REGISTRY_AUTH_TOKEN=<AUTH_TOKEN>
# or
$env:VODE_APP_REGISTRY_AUTH_TOKEN = "<AUTH_TOKEN>"
npm publish
```

## CI/CD Workflows

### Build and Publish

⚠️ `.npmrc` configuring the package registry and its authentication token is required for the workflow to work.

|Parameter|Type|Description|
|-----|-----|-----|
|`RUNNER_LABEL`|Variable|The label of the runner to use for the workflow.|
|`ACCESS_TOKEN`|Secret|The authentication token for the package registry.|

`.github/workflows/build-publish.yml`:

```yaml
name: Build and Publish

on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ${{ vars.RUNNER_LABEL }}
    steps:
      - uses: actions/checkout@v4

      - name: Install
        env:
          VODE_APP_REGISTRY_AUTH_TOKEN: ${{ secrets.ACCESS_TOKEN }}
        run: npm ci

      - name: Build
        run: npm run build

      - name: Test
        run: npm run tests

      - name: Publish
        env:
          VODE_APP_REGISTRY_AUTH_TOKEN: ${{ secrets.ACCESS_TOKEN }}
        run: |
          PKG_NAME=$(node -p "require('./package.json').name")
          PKG_VERSION=$(node -p "require('./package.json').version")
          NPM_TAG="latest"
          if echo "$PKG_VERSION" | grep -q -- '-'; then
            NPM_TAG="next"
          fi
          if npm view "$PKG_NAME@$PKG_VERSION" version >/dev/null 2>&1; then
            echo "$PKG_NAME@$PKG_VERSION already published, skipping."
          else
            npm publish --tag "$NPM_TAG"
          fi
```
