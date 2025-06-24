# Development Guidelines

# Schema

-   Always refers `schema.dbml` & `api-schema.yaml` as data structure reference.

## Tech Stack

-   **Framework**: Next.js 15 with React 18
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS with shadcn/ui components
-   **Package Manager**: npm
-   **Database**: Local storage (for prototype), but designed for SQLite implementation
-   **State Management**: React Context API
-   **Authentication**: Custom authentication (email/password)
-   **Date Handling**: date-fns
-   **Charts**: Recharts
-   **Form Handling**: react-hook-form with zod validation

# Example Code

-   Use code from `users` module as references

## Error Handling

-   Always show validation error from server

## After Action

-   Show alert after any action (create, update, delete) with success or error message.

## Prevent action

-   Use popup confirmation before delete action.
