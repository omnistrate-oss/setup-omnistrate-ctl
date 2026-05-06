# Setup Omnistrate CTL

[![GitHub Super-Linter](https://github.com/omnistrate-oss/setup-omnistrate-ctl/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/omnistrate-oss/setup-omnistrate-ctl/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/omnistrate-oss/setup-omnistrate-ctl/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/setup-omnistrate-ctl/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/omnistrate-oss/setup-omnistrate-ctl/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/setup-omnistrate-ctl/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## About

This action allows you to easily setup Omnistrate CTL command line to be able to
create and operate Omnistrate services. It supports two authentication methods:

- **API key** (recommended for CI/CD) — pass an `api-key` input
- **Email and password** — pass `email` and `password` inputs

We recommend storing credentials as GitHub Actions secrets. It also allows you
to optionally set a version of the Omnistrate CTL command to use or uses latest
by default.

> **Note:** By default, the action does **not** run `omnistrate-ctl logout`
> after the workflow completes. If you want the temporary access token to be
> removed from the runner at the end of the job, set `logout: true`.

---

- [Usage](#usage)
- [Customizing](#customizing)
  - [inputs](#inputs)
- [Contributing](#contributing)
- [About Omnistrate](#about-omnistrate)

---

---

## Usage

### API key authentication (recommended)

API keys are the recommended authentication method for CI/CD pipelines. They
provide scoped, revocable credentials that don't require sharing personal
email/password secrets.

#### Obtaining an API key

1. Log in to the [Omnistrate Console](https://console.omnistrate.cloud/)
2. Navigate to **Settings → API Keys**
3. Click **Create API Key**, give it a name and select the desired permissions
4. Copy the generated key (starts with `om_`) — it is only shown once
5. Store it as a GitHub Actions secret (e.g., `OMNISTRATE_API_KEY`)

#### Basic usage

```yaml
- name: Setup Omnistrate CTL
  uses: omnistrate-oss/setup-omnistrate-ctl@v1
  with:
    api-key: ${{ secrets.OMNISTRATE_API_KEY }}

- name: Test CTL command
  shell: bash
  run: |
    omnistrate-ctl --version
    omctl --version
```

#### With token revocation disabled

If you don't want the action to revoke the server-side token after the job
(e.g., for debugging or when reusing tokens across jobs), set `skip-revoke`:

```yaml
- name: Setup Omnistrate CTL
  uses: omnistrate-oss/setup-omnistrate-ctl@v1
  with:
    api-key: ${{ secrets.OMNISTRATE_API_KEY }}
    skip-revoke: 'true'
```

#### With a specific CTL version

```yaml
- name: Setup Omnistrate CTL
  uses: omnistrate-oss/setup-omnistrate-ctl@v1
  with:
    api-key: ${{ secrets.OMNISTRATE_API_KEY }}
    version: 'v1.0.8'
```

### Email and password authentication

```yaml
- name: Setup Omnistrate CTL
  uses: omnistrate-oss/setup-omnistrate-ctl@v1
  with:
    email: ${{ secrets.OMNISTRATE_USERNAME }}
    password: ${{ secrets.OMNISTRATE_PASSWORD }}
    version: latest # OPTIONAL

# Execute and example command
- name: Test CTL command
  shell: bash
  run: |
    # run simple command as an example
    omnistrate-ctl --version
    # omctl alias is also supported
    omctl --version
```

### Security notes

- **Secrets are masked**: Both `api-key` and `password` are registered with the
  Actions runner via `core.setSecret()`, ensuring they are redacted in all log
  output.
- **No CLI argument exposure**: Credentials are passed via stdin (`--password-stdin`
  / `--api-key-stdin`), so they never appear in process lists or debug logs.
- **Post-job cleanup**: By default the action revokes the refresh token on the
  server and removes local credentials from the runner.
- **Prefer API keys over email/password**: API keys can be scoped and rotated
  independently without affecting your user account.

## Customizing

### inputs

The following inputs can be used as `step.with` keys:

| Name          | Type   | Description                                                                  |
| ------------- | ------ | ---------------------------------------------------------------------------- |
| `api-key`     | String | API key (`om_...`). Recommended for CI                                       |
| `email`       | String | Email to log in to Omnistrate                                                |
| `password`    | String | Password to log in to Omnistrate                                             |
| `version`     | String | CTL version (default: `latest`)                                              |
| `logout`      | String | Logout after job — revokes **all sessions on all devices** (default: `true`) |
| `skip-revoke` | String | Skip server-side token revocation — only affects the **current token**, not other sessions (default: `false`) |

> When both `api-key` and `email`/`password` are provided, `api-key` takes
> precedence.
>
> **Security:** By default, the post step runs `omnistrate-ctl revoke-token` to
> invalidate the refresh token on the server before cleaning up local
> credentials. Set `skip-revoke: true` to only remove local credentials.

## Contributing

Want to contribute? Awesome! You can find information about contributing to this
project in the [CONTRIBUTING](/CONTRIBUTING.md) page

## About Omnistrate

[Omnistrate](https://omnistrate.com/) is the operating system for your SaaS,
offering enterprise-grade capabilities: automated provisioning, serverless
capabilities, auto-scaling, billing, monitoring, centralized logging,
self-healing, intelligent patching and much more!
