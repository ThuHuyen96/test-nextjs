# Next.js Variable & Function Naming Conventions

## 1. Variables — `camelCase`, Descriptive
Use specific names that explain the role.

```ts
// ❌ Bad
const data = {};
const info = [];

// ✅ Good
const userDataProfile = {};
const categoryListItems = [];
```

## 2. Constants — `SNAKE_CASE`
Global constants, configuration objects, and fixed values.

```ts
// ✅ Good
const MAX_LOGIN_ATTEMPTS = 5;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const HTTP_STATUS = {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
    SERVER_ERROR: 500
} as const;
```

## 3. Event Handlers — `on` Prefix
All functions triggered by events MUST use the `on` prefix. This applies to props and local handlers.

```tsx
// ✅ Good
function onClickSubmit() { ... }
function onChangeEmail(event: React.ChangeEvent<HTMLInputElement>) { ... }

<Button onClick={onClickSubmit}>Save</Button>
<Input onChange={onChangeEmail} />

// ❌ Bad
function handleSubmit() { ... }
function handleEmail() { ... }
```

## 4. Booleans — `is`, `has`, `can` Prefix
Boolean variables must be phrased as questions or states.

```ts
// ✅ Good
const isLoading = true;
const hasPermission = false;
const canEditProfile = true;

// ❌ Bad
const loading = true;
const permission = false;
```

## 5. Explicit Return Types
Always annotate the return type of functions to ensure consistency and catch errors early.

```tsx
// ✅ Good
const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

// Next.js Component with explicit return
const UserAvatar = ({ src }: { src: string }): React.ReactElement => {
  return <img src={src} alt="User" />;
};
```

## 6. No Underscore Prefix
Avoid using underscores to denote "private" variables. Use naming or scoping instead.

```ts
// ❌ Bad
const _count = 0;

// ✅ Good
const internalCount = 0;
```
