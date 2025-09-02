# GitHub Configuration

This directory contains GitHub-specific configuration files for the summarize-web repository.

## Dependabot Configuration

The `dependabot.yml` file configures automated dependency updates with the following features:

### Update Schedule
- **Frequency**: Monthly updates (closest to quarterly that GitHub Dependabot supports)
- **Day**: Mondays at 9:00 UTC
- **Limit**: Maximum 5 open pull requests at once

### Dependency Groups
Dependencies are organized into logical groups to reduce noise and make reviews easier:

1. **build-tools**: Vite and related build tooling
   - `vite`
   - `vite-plugin-*`

2. **dev-tools**: Development and tooling dependencies
   - `@biomejs/*` (code formatting/linting)
   - `@types/*` (TypeScript type definitions)
   - Testing frameworks and related tools

3. **runtime-deps**: Core runtime dependencies
   - `@mozilla/readability`
   - `zod`
   - `webextension-polyfill`

### PR Configuration
- **Labels**: `dependencies`, `automated`
- **Commit prefix**: `deps`
- **Rebase strategy**: Automatic
- **Scope**: Both direct and indirect dependencies

### Customization
To modify the configuration:
1. Edit `.github/dependabot.yml`
2. Uncomment and configure reviewers/assignees if needed
3. Adjust grouping patterns for new dependency types
4. Modify schedule or limits as needed

For more information, see the [GitHub Dependabot documentation](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file).