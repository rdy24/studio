# Voyage Control

## Features

### User Management

-   User registration and authentication
-   Role-based access control
-   User profile management
-   User status tracking (Active, Inactive, Pending)

### Role Management

-   Create, read, update, delete (CRUD) operations for roles
-   Permission assignment to roles
-   Predefined roles (Administrator, Travel Agent, Support Staff)

### Destination Management

-   CRUD operations for travel destinations
-   Destination details including name, country, description, and images

### Voyage Management

-   CRUD operations for travel voyages/trips
-   Voyage scheduling with start and end dates
-   Pricing information
-   Status tracking (Upcoming, Ongoing, Completed, Cancelled)
-   Multi-destination voyages

### Dashboard

-   Overview of key metrics (users, voyages, bookings, destinations)
-   Monthly booking trends visualization
-   Recent activity feed

## Application Flow

1. **Authentication Flow**

    - User lands on the home page and is redirected to the login page
    - User enters credentials and is authenticated
    - Upon successful login, user is redirected to the dashboard

2. **Dashboard Overview**

    - User views key metrics and statistics
    - Recent activity feed shows system updates
    - Navigation to specific management sections

3. **User Management Flow**

    - View list of all users with pagination and search
    - Add new users with role assignment
    - Edit existing user details and status
    - Delete users

4. **Role Management Flow**

    - View list of all roles with pagination and search
    - Add new roles with specific permissions
    - Edit existing role details and permissions
    - Delete roles

5. **Destination Management Flow**

    - View list of all destinations with pagination and search
    - Add new destinations with details and images
    - Edit existing destination information
    - Delete destinations

6. **Voyage Management Flow**

    - View list of all voyages with pagination and search
    - Add new voyages with destination selection, dates, and pricing
    - Edit existing voyage details
    - Delete voyages
    - Track voyage status through its lifecycle

7. **Data Persistence**
    - All data is stored in local storage for the prototype
    - The application is designed to be easily adapted to a SQLite database

## Responsive Design

The application is fully responsive and works on mobile, tablet, and desktop devices with adaptive layouts and components.
