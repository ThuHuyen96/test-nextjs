# React & Next.js Implementation Patterns

## 1. Server vs Client Components
- **Server Components (default)**: Use for data fetching, accessing backend resources, and static UI.
- **Client Components (`'use client'`)**: Use for interactivity (state, effects, event listeners) and browser-only APIs.

**Rule**: Keep Client Components at the leaf level to maximize server-side benefits.

## 2. Component Props
Always use TypeScript interfaces to define props. Suffix the interface with `Props`.

```tsx
interface ProfileCardProps {
  userId: string;
  userName: string;
  isAdmin?: boolean; // Optional prop
}

const ProfileCard = ({ userId, userName, isAdmin = false }: ProfileCardProps): React.ReactElement => {
  return (
    <div>{userName}</div>
  );
};
```

## 3. Fragment Usage
Use `<>...</>` to group elements without adding extra nodes to the DOM.

```tsx
// ✅ Good
return (
  <>
    <Header />
    <MainContent />
  </>
);
```

## 4. Key Prop in Lists
Never use array index as a `key` if the list can change. Use unique IDs.

```tsx
// ✅ Good
{users.map((user) => (
  <UserItem key={user.id} data={user} />
))}
```

## 5. Tailwind CSS Strategy
- Use utility classes directly in `className`.
- Use `clsx` or `tailwind-merge` for conditional classes.
- Avoid using `@apply` in CSS files unless creating a very common reusable base.

```tsx
import { cn } from '@/lib/utils'; // utility using tailwind-merge

const Button = ({ active }: { active: boolean }) => (
  <button className={cn('px-4 py-2', active ? 'bg-blue-500' : 'bg-gray-200')}>
    Click Me
  </button>
);
```

## 6. Server Actions
Use Server Actions for form submissions and data mutations. Ensure they are in a separate file with `'use server'` at the top or within a server component.

```ts
// app/actions.ts
'use server'

export async function updateUserProfile(formData: FormData) {
  // logic to update DB
}
```

## 7. Loading & Error States
Always implement `loading.tsx` and `error.tsx` for a better user experience during data fetching. Use `Suspense` for granular loading control.
