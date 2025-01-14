# Front-end Style Guide

## Purpose

This style guide defines the coding standards and conventions for contributors to ensure consistency and maintainability across the project. Following these guidelines will help the team build components that are easy to read, scalable, and maintainable.

## General Principles

- **Readability**: Code should be as self-explanatory as possible.
- **Consistency**: Stick to the style guide in all files and components.
- **Accessibility**: Ensure components are accessible for all users.

## Project Structure

- Organize files in a scalable and maintainable structure.
- Organize all components within the `/components` directory, placing each component in a folder that clearly represents its functionality.
- Internal-use components should be placed in the `/internal` folder.

## Naming Conventions

- Use **PascalCase** for React component names. Example: `ButtonGroup.jsx`
- Use **camelCase** for function and variable names. Example: `handleClick`, `buttonColor`.
- Use **kebab-case** for file names. Example: `copy-text.ts`.

## JavaScript/TypeScript Guidelines

- Use TypeScript for all components to ensure type safety.

- Destructure props in function arguments to improve readability.

- Keep functions small with single responsibility.

## Tailwind CSS Guidelines

- Use Tailwind’s utility-first classes for styling.

- Avoid custom CSS; prefer Tailwind’s built-in utilities.

- For any custom styles (if required), use inline styles.

- Adhere to the colors specified in the Tailwind config.

- Import all icons from lucide react.

### Responsive Design

- Implement a mobile-first design approach.

- Use Tailwind's responsive utilities (`sm`,`md`,`lg`,`xl`) to ensure responsiveness.

## Accessibility Guidelines

- Ensure all interactive elements, such as buttons and links, are fully keyboard accessible (e.g., dropdowns navigable with arrow keys, dialogs closable with the `Escape` key).

- Use semantic HTML elements ( `<button>`, `<nav>`, and `<header>`),to provide meaningful structure for assistive technologies.

- Synchronize ARIA attributes with component state (e.g., `aria-expanded` for dropdowns, `aria-checked` for toggles).

- Handle focus management properly. Ensure users cannot tab to elements behind active dialogs, and auto-focus the first item when dropdowns open.

- Apply appropriate `aria-labels` to ensure clarity for screen readers and other assistive technologies.

For further guidance on building accessible UI components, refer to the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) by the W3C.

## Code Quality & Collaboration

### Code Formatting

- **Prettier** is used for consistent code formatting across the project.

- **ESLint** is configured with Tailwind and React rules for linting.

- **Husky** is set up with pre-commit hooks to ensure code is formatted and linted before commits.

### Commit Messages

Follow this format for commit messages:

- `feat`: for new features.
- `fix`: for bug fixes.
- `chore`:Tooling, configuration changes, or maintenance updates.
- `perf`: improving performance,
- `test`: Adding or updating tests,
- `style`: for stylistic changes related to Tailwind classes or general formatting.
- `docs`: for documentation updates.
- `refactor`: for code refactoring without adding features or fixing bugs.
- `build`: changes that affect the build system,

Make small, focused commits to ensure that reviews are easier and changes are more traceable.

## Conclusion

By following this style guide, we ensure that our project is scalable, maintainable, and adheres to best practices. If you have any questions, feel free to ask during code reviews or reach out via the project's communication channels.
