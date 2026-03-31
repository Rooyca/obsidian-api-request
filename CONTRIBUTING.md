# Contributing to API Request Plugin

Thank you for your interest in contributing to the API Request plugin! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/obsidian-api-request.git`
3. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Obsidian (for testing)

### Installation

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Development mode (auto-rebuild on changes)
npm run dev
```

### Project Structure

```
obsidian-api-request/
├── src/
│   ├── main.ts                 # Main plugin file
│   ├── functions/
│   │   ├── general.ts          # General utility functions
│   │   ├── regx.ts             # Regular expressions
│   │   ├── security.ts         # Security utilities
│   │   └── frontmatterUtils.ts # Frontmatter parsing
│   └── settings/
│       ├── settingsData.ts     # Settings interface
│       └── settingsTab.ts      # Settings UI
├── docs/                       # Documentation
├── main.js                     # Compiled output
├── manifest.json               # Plugin manifest
└── package.json                # Dependencies
```

## Making Changes

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `security/` - Security improvements

### Commit Messages

Follow conventional commits format:

```
type(scope): brief description

Longer description if needed

- Additional details
- More details
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `security`: Security improvements

Examples:
```
feat(request): add support for PATCH method

fix(cache): prevent race condition in localStorage

docs(readme): add security best practices section

security(validation): sanitize UUID input to prevent injection
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Add proper type annotations
- Avoid `any` type when possible
- Use interfaces for complex types

### Documentation

- Add JSDoc comments to all public functions
- Include `@param`, `@returns`, `@throws` tags
- Add `@example` for complex functions
- Document security considerations with `@security` tag

Example:
```typescript
/**
 * Validates a URL to ensure it's safe to request
 * 
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 * @security Only allows http:// and https:// protocols
 * @example
 * isValidUrl("https://api.example.com") // returns true
 * isValidUrl("file:///etc/passwd") // returns false
 */
export function isValidUrl(url: string): boolean {
    // implementation
}
```

### Code Organization

- Keep functions focused and single-purpose
- Extract magic numbers to constants
- Use descriptive variable names
- Limit function length to ~50 lines

### Error Handling

- Always wrap risky operations in try-catch
- Log errors to console with context
- Show user-friendly error messages via Notice
- Never expose sensitive data in errors

Example:
```typescript
try {
    const data = localStorage.getItem(key);
    if (data) {
        return safeJsonParse(data);
    }
} catch (e: any) {
    console.error("Error reading from localStorage:", e);
    new Notice("Error: Failed to retrieve cached data");
    return null;
}
```

## Testing

### Manual Testing

1. Build the plugin: `npm run build`
2. Copy `main.js`, `manifest.json`, and `styles.css` to your Obsidian vault's plugins folder
3. Reload Obsidian
4. Test your changes thoroughly

### Test Cases to Verify

- URL validation with various protocols
- UUID sanitization with special characters
- JSONPath injection attempts
- File path traversal attempts
- XSS prevention in format strings
- Error handling for network failures
- localStorage cache operations
- Variable substitution (global, frontmatter, localStorage)

### Security Testing

Before submitting security-related changes:

1. Test with malicious inputs
2. Verify input sanitization
3. Check for XSS vulnerabilities
4. Test error handling edge cases
5. Review console logs for sensitive data leaks

## Submitting Changes

### Pull Request Process

1. Update documentation if needed
2. Add yourself to contributors if first contribution
3. Ensure the build passes: `npm run build`
4. Update CHANGELOG.md if significant change
5. Create a pull request with:
   - Clear title describing the change
   - Description of what and why
   - Related issue numbers
   - Screenshots for UI changes
   - Testing steps

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Security improvement

## Testing
Steps to test the changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Added/updated documentation
- [ ] Tested manually
- [ ] No console errors
- [ ] Updated CHANGELOG.md
```

### Review Process

- Maintainers will review your PR
- Address feedback and requested changes
- Once approved, your PR will be merged

## Reporting Bugs

### Before Reporting

1. Check existing issues
2. Verify you're using the latest version
3. Reproduce the bug with minimal configuration

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- Plugin version: 
- Obsidian version:
- OS:

**Additional Context**
Any other relevant information
```

## Requesting Features

### Feature Request Template

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered

**Additional Context**
Examples, mockups, related issues
```

## Security Issues

**Do not report security vulnerabilities in public issues!**

See [SECURITY.md](SECURITY.md) for how to report security issues.

## Code Review Guidelines

When reviewing code:

1. **Functionality**: Does it work as intended?
2. **Security**: Are inputs validated? Any XSS risks?
3. **Performance**: Any unnecessary operations?
4. **Maintainability**: Is the code clear and documented?
5. **Consistency**: Does it follow project conventions?

## Development Tips

### Hot Reload

For faster development:
1. Run `npm run dev` to watch for changes
2. Use Obsidian's developer tools (Ctrl+Shift+I)
3. Reload plugin: Ctrl+R in dev tools

### Debugging

```typescript
// Add debug logging
console.log("Debug:", variable);

// Use Obsidian's Notice for user feedback
new Notice("Debug: Operation completed");

// Use debugger breakpoints
debugger;
```

### Common Issues

**Build fails**: 
- Check TypeScript errors: `npm run build`
- Verify all imports are correct
- Check for missing type definitions

**Plugin not loading**:
- Verify manifest.json is correct
- Check Obsidian console for errors
- Ensure minAppVersion matches your Obsidian

**Changes not appearing**:
- Rebuild: `npm run build`
- Reload Obsidian: Ctrl+R
- Check file is copied to correct location

## Questions?

- Open a discussion on GitHub
- Ask in issues (for bug-related questions)
- Check existing documentation

## Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Credited in the plugin description

Thank you for contributing! 🎉
