# GitHub Action to integrate your CI with Omnistrate

[![GitHub Super-Linter](https://github.com/omnistrate/setup-omnistrate-ctl/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/omnistrate/setup-omnistrate-ctl/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/omnistrate/setup-omnistrate-ctl/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/setup-omnistrate-ctl/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/omnistrate/setup-omnistrate-ctl/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/setup-omnistrate-ctl/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## Introduction

This action allows you to easily setup Omnistrate CTL command like to be able to
create and operate Omnistrate services. It allows to optionally set up a version
of the Omnistrate CTL command to use or uses latest by default. It also allows
to setup a email and password to use to login to Omnistrate, we recommend
storing the email and passwords as secrets in GitHub and reference those secrets
from the Action. Using this action ensures that the logout command is executed
at the end of the workflow so the temporal token to access Omnistrate is removed
from the host machine.

## Usage

- **Create secrets in your repository for your Omnistrate email and password**

```yaml
- name: Update Docker Image Tag on Omnistrate
  uses: omnistrate/setup-omnistrate-ctl@v1
  with:
    email: ${{ secrets.OMNISTRATE_USERNAME }} # OPTIONAL
    password: ${{ secrets.OMNISTRATE_PASSWORD }} # OPTIONAL
    version: latest # OPTIONAL

# Execute and example command
- name: Test CTL command
  run: |
    # rum simple command as an example
    omnistrate-ctl --version
    # octl alias is also supported
    octl --version
```
