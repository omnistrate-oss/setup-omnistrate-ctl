# Setup Omnistrate CTL

[![GitHub Super-Linter](https://github.com/omnistrate/setup-omnistrate-ctl/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/omnistrate/setup-omnistrate-ctl/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/omnistrate/setup-omnistrate-ctl/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/setup-omnistrate-ctl/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/omnistrate/setup-omnistrate-ctl/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/setup-omnistrate-ctl/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## About

This action allows you to easily setup Omnistrate CTL command like to be able to
create and operate Omnistrate services. It allows to setup a email and password
to use to login to Omnistrate, we recommend storing the email and passwords as
secrets in GitHub and reference those secrets from the Action. It also allows to
optionally set up a version of the Omnistrate CTL command to use or uses latest
by default. Using this action ensures that the logout command is executed at the
end of the workflow so the temporal token to access Omnistrate is removed from
the host machine.

---

- [Usage](#usage)
- [Customizing](#customizing)
  - [inputs](#inputs)
- [Contributing](#contributing)
- [About Omnistrate](#about-omnistrate)

---

---

## Usage

- **Create secrets in your repository for your Omnistrate email and password**

```yaml
- name: Setup Omnistrate CTL
  uses: omnistrate/setup-omnistrate-ctl@v1
  with:
    email: ${{ secrets.OMNISTRATE_USERNAME }}
    password: ${{ secrets.OMNISTRATE_PASSWORD }}
    version: latest # OPTIONAL

# Execute and example command
- name: Test CTL command
  shell: bash
  run: |
    # rum simple command as an example
    omnistrate-ctl --version
    # omctl alias is also supported
    omctl --version
```

## Customizing

### inputs

The following inputs can be used as `step.with` keys:

| Name       | Type   | Description                                       |
| ---------- | ------ | ------------------------------------------------- |
| `email`    | String | Email of the user used to log in to Omnistrate    |
| `password` | String | Password of the user used to log in to Omnistrate |
| `version`  | String | Version of the CTL to used (default:latest)       |

## Contributing

Want to contribute? Awesome! You can find information about contributing to this
project in the [CONTRIBUTING.md](/.github/CONTRIBUTING.md)

## About Omnistrate

[Omnistrate](https://omnistrate.com/) is the operating system for your SaaS,
offering enterprise-grade capabilities: automated provisioning, serverless
capabilities, auto-scaling, billing, monitoring, centralized logging,
self-healing, intelligent patching and much more!
