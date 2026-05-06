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
