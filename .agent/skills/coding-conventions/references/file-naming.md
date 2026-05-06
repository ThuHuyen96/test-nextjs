# Next.js File Naming Conventions

## 1. App Router Reserved Files
Next.js App Router uses specific file names for routing and metadata. These MUST be lowercase.

| Filename | Purpose |
|---|---|
| `page.tsx` | Main content for a route |
| `layout.tsx` | Shared UI for a segment and its children |
| `loading.tsx` | Loading UI for a segment |
| `error.tsx` | Error UI for a segment |
| `not-found.tsx` | 404 UI for a segment |
| `route.ts` | API route handler |
| `template.tsx` | Similar to layout but re-renders on navigation |
| `default.tsx` | Fallback for Parallel Routes |

## 2. React Components — `PascalCase`
All reusable UI components must use PascalCase.

```tsx
// ✅ Good
components/ui/PrimaryButton.tsx
components/forms/UserLoginForm.tsx

// ❌ Bad
components/ui/primary-button.tsx
components/ui/primaryButton.tsx
```

## 3. Custom Hooks — `camelCase`
Hooks must start with `use` and use camelCase.

```ts
// ✅ Good
hooks/useAuthSession.ts
hooks/useDebouncedValue.ts

// ❌ Bad
hooks/UseAuth.ts
hooks/auth-hook.ts
```

## 4. TypeScript Files — `kebab-case`
Utilities, services, and non-component logic files use kebab-case.

```ts
// ✅ Good
lib/api-client.ts
utils/date-formatter.ts
services/auth-service.ts

// ❌ Bad
lib/ApiClient.ts
utils/dateFormatter.ts
```

## 5. Type Definitions — `{kebab-case}.type.ts`
Separate type files should be explicitly marked.

```ts
// ✅ Good
types/user-profile.type.ts
types/api-response.type.ts
```

## 6. Directories — `kebab-case`
All folder names must use kebab-case.

```bash
# ✅ Good
src/user-profile/
src/data-table/

# ❌ Bad
src/UserProfile/
src/userProfile/
```
