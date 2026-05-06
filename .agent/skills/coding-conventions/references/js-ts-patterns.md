# Next.js JS/TS Patterns

## 1. No `enum`
Use `as const` objects and union types for better type safety and smaller bundle sizes.

```ts
// ❌ Bad
enum UserRole {
  Admin = 'ADMIN',
  User = 'USER'
}

// ✅ Good
export const USER_ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
```

## 2. Avoid Literal Strings & Numbers
Use constant objects to store magic strings/numbers.

```ts
// ❌ Bad
if (status === 'active') { ... }

// ✅ Good
const STATUS = { ACTIVE: 'active' } as const;
if (status === STATUS.ACTIVE) { ... }
```

## 3. No Nested `if`
Max depth is 1. Use guard clauses (early returns) to keep code flat.

```ts
// ❌ Bad
function processUser(user) {
  if (user) {
    if (user.isActive) {
      // do something
    }
  }
}

// ✅ Good
function processUser(user) {
  if (!user || !user.isActive) return;
  
  // do something
}
```

## 4. Immutability
Always treat state and data as immutable. Use spread operators or non-mutating methods.

```ts
// ❌ Bad
const list = [1, 2];
list.push(3);

// ✅ Good
const list = [1, 2];
const newList = [...list, 3];
```

## 5. Single Responsibility
One function should do one thing. If a function is too long, break it down.

```ts
// ✅ Good
const validateInput = (input: string): boolean => { ... };
const saveToDatabase = async (data: any): Promise<void> => { ... };

const onSubmit = async (input: string) => {
  if (!validateInput(input)) return;
  await saveToDatabase(input);
};
```
