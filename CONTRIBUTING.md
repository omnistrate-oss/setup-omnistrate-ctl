# Contributing Guidelines

Thank you for considering contributing to this project! We welcome all
contributions, whether it’s fixing a bug, suggesting a new feature, or improving
the documentation. Please take a moment to review this guide to ensure your
contributions can be easily integrated into the project.

## Getting Started

1. Fork the repository: Click the "Fork" button at the top right of the GitHub
   repository.
1. Clone your fork:

   ```bash
   git clone https://github.com/omnistrate/setup-omnistrate-ctl.git
   cd repository-name
   ```

1. Create a branch: Create a new branch for every change you make. Use a
   descriptive branch name:

   ```bash
   git checkout -b feature/your-feature-name
   ```

## Making Changes

1. Ensure each change is isolated in its own branch.
1. Use clear, descriptive commit messages for every change. For example: "Fix
   bug in user login" or "Add feature to export user data"
1. Make sure your code follows the project’s coding style and is properly
   documented.

## Submitting a Pull Request

1. Ensure your branch is up to date with the main branch:

   ```bash
   git fetch origin
   git merge origin/main
   ```

1. Run tests: Ensure all tests pass and add tests for any new functionality.
1. Create a Pull Request for every change:
   - Go to your forked repository and click "New Pull Request."
   - Provide a detailed description of the change, and the issue(s) addressed,
     if applicable.
1. Link Issues: If your change addresses any GitHub issues, mention them in your
   PR description by using the syntax Fixes #issue-number.

## Review Process

- Your Pull Request will be reviewed by maintainers or contributors. Be open to
  suggestions and revisions.
- Ensure you respond to any feedback or requested changes in a timely manner to
  help move the PR forward.

## Guidelines

- Create a new branch for every change: This helps isolate changes and makes the
  review process more manageable.
- Follow coding standards: Make sure your code adheres to the language-specific
  standards of the project.
- Documentation: Update any relevant documentation to reflect your changes.
- Commit often: It’s easier to review small, incremental changes rather than
  large chunks of code at once.

## Issues

Feel free to report bugs or suggest features by opening a new
[issue](https://github.com/omnistrate/setup-omnistrate-ctl/issues). Before
submitting, check if the issue already exists. If so, feel free to comment on
it.
