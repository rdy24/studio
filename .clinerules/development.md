# Development Guidelines

# Schema

-   Always refers `schema.dbml` & `api-schema.yaml` as data structure reference.

# Tech Stack

### UI Framework & Styling

-   **Tailwind CSS 3.4.1** - Utility-first CSS framework
-   **Radix UI** - Headless UI components for accessibility
-   **Lucide React** - Icon library
-   **next-themes** - Dark/light theme support
-   **Recharts** - Chart and data visualization library

### Form Handling & Validation

-   **React Hook Form 7.54.2** - Form state management
-   **Zod 3.24.2** - Schema validation
-   **@hookform/resolvers** - Form validation resolvers

### Framework & Runtime

-   **Next.js 15.3.3** - React-based full-stack framework with App Router
-   **React 18.3.1** - Frontend library for building user interfaces
-   **TypeScript 5** - Type-safe JavaScript development
-   **Node.js** - JavaScript runtime environment

## Standard Practices

### Code Structure

-   Use **TypeScript** for type safety and better developer experience.
-   Organize components in a modular way, grouping related files together.
-   Use **Context API** for state management to avoid prop drilling.
-   Keep components small and focused on a single responsibility.

### Response And Error Handling

-   Use **try/catch** blocks for asynchronous operations to handle errors gracefully.
-   Implement a global error handler to catch unhandled errors and provide user feedback.
-   Use **HTTP status codes** to indicate success or failure of API requests.

### Response Data Structure

-   Use a consistent response structure for API endpoints:

```json
{
  "data": any, // The actual data returned by the endpoint
  "error": string | null // Error message if any
  "message": string // Optional message for additional context
  "status_code": number // HTTP status code
}
```
