# Copilot Instructions for setup-omnistrate-ctl

<!-- security-checklist-managed -->

## Security Checklist

Apply this checklist to every code change. If a control is not applicable, briefly say why in the PR description.

### Authentication & Token Handling
- Store auth tokens in the OS keychain when available (macOS Keychain, Windows Credential Manager, Secret Service / libsecret). Fall back to a file with `0600` permissions in the user's home directory only when no keychain is available, and warn the user.
- Never write tokens, refresh tokens, or session cookies to stdout/stderr or log files. Redact `Authorization` headers from any debug/verbose output.
- Honor token TTLs: refresh proactively, clear on `logout`, and never persist a token after `--logout` / `--clear-credentials`.
- When prompting for credentials, read from a TTY without echo (`term.ReadPassword` / equivalent). Do not accept passwords as command-line flags.

### Authorization
- The CLI must not assume the local user has any role — let the server return 401/403 and surface a clear error. Do not cache role decisions across sessions.
- Destructive commands (`delete`, `rotate`, `purge`) must require an explicit confirmation flag (`--yes`) or interactive prompt. No silent destructive defaults.

### Input Validation
- For commands intended to operate within a base directory, canonicalize paths, resolve symlinks, and enforce that the result stays under the allowed base. (Blanket rejection of `..` is not appropriate for a general-purpose CLI.)
- Validate URLs (scheme allowlist: `https`, optionally `http` only for `localhost`). Reject `file://`, `javascript:`, etc.
- Use safe YAML/JSON loaders. For YAML, disallow custom tags / arbitrary type construction. Cap input file sizes.
- When templating user input into config, escape per the target format (shell, YAML, JSON, URL) — never `fmt.Sprintf` user input into a shell command.

### Subprocess Execution
- Use `exec.Command(name, args...)` with explicit arguments. Never invoke `sh -c` / `cmd /c` with interpolated user input.
- Pass secrets to subprocesses via env vars or stdin, not via command-line arguments (which appear in `ps`).
- Validate or hash-pin any binary the CLI downloads and executes (e.g., `kubectl`, `helm`, `terraform`).

### Secrets Handling
- No secrets in source, fixtures, or test recordings. Scrub HTTP recordings (`go-vcr`, etc.) before committing.
- Files written by the CLI that contain credentials, kubeconfigs, or signed URLs must be `0600` and in a per-user directory.
- Do not include secrets in telemetry, crash reports, or `--debug` output.

### Logging & Output Hygiene
- `--verbose` / `--debug` must not enable secret logging. Maintain a redaction layer that runs even at the highest verbosity.
- Errors shown to the user should be actionable and free of internal stack traces, raw HTTP responses, or upstream tokens.
- Progress output to TTY only; structured logs (JSON) for non-TTY / CI use.

### Dependencies & Supply Chain
- Run `govulncheck ./...` (or `npm audit` for TS) on changes touching dependencies. Address findings.
- Pin module versions. Justify any new third-party dependency in the PR description.
- Releases must publish checksums and, where possible, signatures (cosign, Sigstore). Homebrew / installer scripts must verify checksums before installing.
- Pin GitHub Actions to commit SHAs.

### Update & Distribution Safety
- Self-update / install scripts must verify the integrity (checksum + signature) of the downloaded artifact before replacing the binary.
- The default installer should use HTTPS only, with certificate validation enabled.

### What to do when unsure
- If a change touches credential storage, subprocess execution, or download/update flows, call it out explicitly in the PR description and request a security review.
