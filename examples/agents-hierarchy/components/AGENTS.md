# Component-Specific Guidelines

## Component Structure

- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks

## Naming Conventions

- Components: PascalCase (e.g., `UserProfile`)
- Props interfaces: `ComponentNameProps` (e.g., `UserProfileProps`)
- Event handlers: `handleEventName` (e.g., `handleClick`)

## Testing

- Write unit tests for each component
- Test user interactions with React Testing Library
- Achieve at least 80% code coverage

## Styling

- Use CSS modules for component styles
- Follow BEM naming convention for CSS classes
- Keep styles colocated with components
