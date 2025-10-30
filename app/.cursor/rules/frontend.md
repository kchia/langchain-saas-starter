# Frontend Cursor Rules for Next.js/React

## Frontend-Specific Guidelines

### Next.js/React Patterns

- Use App Router patterns (NEVER suggest Pages Router)
- Prefer server components over client components
- Use TypeScript strict mode with proper type definitions
- Follow Next.js 15.5.4 conventions
- Use React Server Components for data fetching when possible
- Implement proper loading states and Suspense boundaries
- Follow component composition patterns over inheritance
- Use proper TypeScript generics for reusable components
- Structure components with clear separation of concerns

### UI/Styling Patterns

- Use shadcn/ui components as primary UI building blocks
- Extend with Radix UI primitives when needed
- Use Tailwind CSS v4 with semantic class composition and CSS variables
- Use Lucide React for consistent iconography
- Implement proper design token systems
- Follow mobile-first responsive design principles
- Use CSS variables for theme customization

### State Management Patterns

- Use Zustand for client state with proper store patterns
- Use TanStack Query for server state, caching, and mutations
- Implement proper error boundaries with fallback UI
- Use React Hook Form for form handling with validation
- Implement proper loading and error states
- Use optimistic updates where appropriate

### Accessibility Patterns

- Implement accessibility testing with axe-core in development
- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation support
- Test with screen readers
- Maintain proper color contrast ratios
- Use proper heading hierarchy

### Performance Patterns

- Use React.memo for expensive components
- Implement proper code splitting
- Use Next.js Image component for optimized images
- Implement proper caching strategies
- Use dynamic imports for heavy dependencies
- Monitor bundle size and performance metrics

## Frontend Anti-Patterns to Avoid

### Architecture

- Don't suggest Pages Router patterns
- Don't mix client/server component patterns incorrectly
- Don't fetch data in client components when server components suffice
- Don't ignore proper loading states
- Don't create unnecessary re-renders

### UI/Styling

- Don't use inline styles (use Tailwind classes)
- Don't ignore responsive design principles
- Don't hardcode colors or spacing (use design tokens)
- Don't ignore accessibility requirements
- Don't use non-semantic HTML elements

### State Management

- Don't use useState for server state (use TanStack Query)
- Don't prop drill when state management solutions exist
- Don't ignore error handling in async operations
- Don't mutate state directly
- Don't ignore loading states for async operations

### Performance

- Don't ignore code splitting opportunities
- Don't load heavy dependencies synchronously
- Don't ignore image optimization
- Don't create memory leaks with uncleared intervals/timeouts
- Don't ignore bundle size impact of dependencies