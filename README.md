# Voyage Control - Travel Operations Back Office System

## Tech Stack

### Framework & Runtime

-   **Next.js 15.3.3** - React-based full-stack framework with App Router
-   **React 18.3.1** - Frontend library for building user interfaces
-   **TypeScript 5** - Type-safe JavaScript development
-   **Node.js** - JavaScript runtime environment

### Package Manager

-   **npm** - Node Package Manager (using package-lock.json)

### Database & Data Management

-   **Local Storage** - Client-side data persistence (prototype implementation)
-   **Context API** - React state management for data flow
-   **No external database** - Currently using browser localStorage for data persistence

### ORM

-   **None** - Direct data manipulation through React Context providers
-   **Custom Context Providers** - UserContext, RoleContext, DestinationContext, VoyageContext

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

### AI Integration

-   **Google Genkit 1.8.0** - AI development framework
-   **@genkit-ai/googleai** - Google AI integration
-   **Firebase 11.9.1** - Backend services integration

## Application Features & Flow

### Core Features

#### 1. Authentication System

-   **Login Page** (`/login`) - Email/password authentication
-   **Protected Routes** - Dashboard requires authentication
-   **User Session Management** - Simulated authentication flow

#### 2. Dashboard Overview (`/dashboard`)

-   **Metrics Display** - Total users, active voyages, bookings, destinations
-   **Data Visualization** - Monthly bookings chart using Recharts
-   **Recent Activity Feed** - System activity timeline
-   **Responsive Design** - Mobile-first approach with adaptive layouts

#### 3. User Management (`/dashboard/users`)

-   **CRUD Operations** - Create, read, update, delete users
-   **User Attributes**:
    -   Personal info (name, email, avatar)
    -   Role assignment (linked to Role Management)
    -   Status management (Active, Inactive, Pending)
    -   Audit trail (date joined, last login)
-   **Search & Filtering** - Real-time search across user data
-   **Pagination** - Table pagination with configurable page size
-   **Bulk Operations** - Individual user actions via dropdown menus

#### 4. Role Management (`/dashboard/roles`)

-   **Permission-Based Access Control** - Granular permission system
-   **Role Attributes**:
    -   Role definition (name, description)
    -   Permission assignment (manage_users, manage_roles, manage_voyages, view_reports, view_bookings, manage_support_tickets)
-   **Role Assignment** - Roles linked to users for access control
-   **Dynamic Permissions** - Checkbox-based permission selection

#### 5. Destination Management (`/dashboard/destinations`)

-   **Travel Destination Catalog** - Geographic location management
-   **Destination Attributes**:
    -   Location info (name, country)
    -   Marketing content (description, images)
    -   Visual representation (image URLs, avatars)
-   **Content Management** - Rich text descriptions and media

#### 6. Voyage Management (`/dashboard/voyages`)

-   **Travel Package Management** - Complete voyage lifecycle
-   **Voyage Attributes**:
    -   Trip details (name, description, images)
    -   Multi-destination support (linked destination IDs)
    -   Scheduling (start/end dates with calendar picker)
    -   Pricing (USD currency)
    -   Status tracking (Upcoming, Ongoing, Completed, Cancelled)
-   **Complex Relationships** - Many-to-many relationship with destinations
-   **Date Management** - Calendar integration with date validation

### Application Flow

#### 1. User Journey

```
Landing (/) → Login (/login) → Dashboard (/dashboard) → Management Pages
```

#### 2. Data Flow Architecture

```
UI Components → Context Providers → Local Storage → State Management
```

#### 3. Navigation Structure

-   **Sidebar Navigation** - Collapsible sidebar with role-based menu items
-   **Responsive Design** - Mobile-friendly navigation with hamburger menu
-   **Theme Support** - Dark/light mode toggle
-   **User Profile** - User navigation component with profile actions

#### 4. State Management Flow

-   **Context Providers** - Centralized state management for each entity
-   **Local Storage Persistence** - Automatic data persistence across sessions
-   **Loading States** - Proper loading indicators for async operations
-   **Error Handling** - Toast notifications for user feedback

### Technical Architecture

#### Component Structure

-   **Page Components** - Next.js App Router pages
-   **UI Components** - Reusable Radix UI-based components
-   **Context Providers** - Data management and business logic
-   **Custom Hooks** - Shared functionality (useToast, useMobile)

#### Data Persistence Strategy

-   **Client-Side Storage** - Browser localStorage for prototype
-   **JSON Serialization** - Structured data storage format
-   **Date Handling** - Proper Date object serialization/deserialization
-   **Error Recovery** - Fallback to initial data on storage errors

#### Responsive Design

-   **Mobile-First** - Progressive enhancement approach
-   **Breakpoint System** - Tailwind CSS responsive utilities
-   **Adaptive Layouts** - Table responsiveness with hidden columns
-   **Touch-Friendly** - Mobile-optimized interactions

This application serves as a comprehensive back-office system for travel operations, providing complete CRUD functionality for managing users, roles, destinations, and voyages with a modern, responsive interface built on Next.js and React.
