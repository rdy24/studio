# Destinations API Testing Guide

This guide provides instructions on how to test the Destinations API using Postman.

## Prerequisites

-   **Postman:** Ensure you have Postman installed.
-   **Voyage Control Application:** The Next.js application should be running locally (e.g., `npm run dev`).
-   **Database Seeded:** The database should be seeded with initial data, including destinations. Run `npx prisma db push && npx prisma db seed` if you haven't already.

## Postman Collection

A Postman collection for Destinations CRUD operations is available at `docs/postman-destinations-simple.json`.

### Importing the Collection

1.  Open Postman.
2.  Click on "Import" in the top left corner.
3.  Select "Upload Files" and choose `docs/postman-destinations-simple.json`.
4.  Click "Import".

### Setting up the Environment

The collection uses a `{{base_url}}` variable. You should set this up in your Postman environment.

1.  In Postman, click on the "Environments" dropdown (usually next to the "No Environment" text).
2.  Select "Manage Environments".
3.  Click "Add" to create a new environment.
4.  Name the environment (e.g., "Voyage Control Local").
5.  Add a new variable:
    -   **Variable:** `base_url`
    -   **Initial Value:** `http://localhost:3000`
    -   **Current Value:** `http://localhost:3000`
6.  Save the environment and select it from the dropdown.

## API Endpoints

The collection includes the following requests:

### 1. Get All Destinations

-   **Method:** `GET`
-   **URL:** `{{base_url}}/api/destinations`
-   **Description:** Retrieves a paginated list of destinations.
-   **Query Parameters (Optional):**
    -   `page`: Page number (default: 1)
    -   `limit`: Number of items per page (default: 10)
    -   `search`: Search by destination name, country, or description.
    -   `country`: Filter by country.
-   **Example:** `{{base_url}}/api/destinations?page=1&limit=5&search=Paris&country=France`

### 2. Create New Destination

-   **Method:** `POST`
-   **URL:** `{{base_url}}/api/destinations`
-   **Description:** Creates a new destination.
-   **Headers:**
    -   `Content-Type: application/json`
-   **Body (raw JSON):**
    ```json
    {
    	"name": "New York",
    	"country": "USA",
    	"description": "The Big Apple, a city that never sleeps.",
    	"image_url": "https://placehold.co/600x400.png?text=NewYork"
    }
    ```
-   **Note:** After creating a destination, copy its `id` from the response. You will use this ID for "Get Destination by ID", "Update Destination", and "Delete Destination" requests. You can set it as an environment variable named `destination_id`.

### 3. Get Destination by ID

-   **Method:** `GET`
-   **URL:** `{{base_url}}/api/destinations/{{destination_id}}`
-   **Description:** Retrieves a single destination by its ID.
-   **Path Variable:** `destination_id` (e.g., `dest-paris` from seed data or a newly created one).

### 4. Update Destination

-   **Method:** `PUT`
-   **URL:** `{{base_url}}/api/destinations/{{destination_id}}`
-   **Description:** Updates an existing destination.
-   **Headers:**
    -   `Content-Type: application/json`
-   **Body (raw JSON):**
    ```json
    {
    	"name": "New York City",
    	"description": "The concrete jungle where dreams are made of."
    }
    ```
-   **Path Variable:** `destination_id`

### 5. Delete Destination

-   **Method:** `DELETE`
-   **URL:** `{{base_url}}/api/destinations/{{destination_id}}`
-   **Description:** Deletes a destination by its ID.
-   **Path Variable:** `destination_id`
-   **Note:** A successful deletion will return a `204 No Content` status.

## Testing Workflow

1.  **Start the Next.js application:** `npm run dev`
2.  **Seed the database:** `npx prisma db push && npx prisma db seed` (if not already done).
3.  **Import the Postman collection** and **set up the environment** as described above.
4.  **Run "Get All Destinations"** to see existing data.
5.  **Run "Create New Destination"**. Copy the `id` from the response and set it as the `destination_id` environment variable.
6.  **Run "Get Destination by ID"** using the copied `destination_id` to verify creation.
7.  **Run "Update Destination"** using the `destination_id` to modify its details.
8.  **Run "Get Destination by ID"** again to verify the update.
9.  **Run "Delete Destination"** using the `destination_id`.
10. **Run "Get Destination by ID"** one last time; it should return a 404 Not Found.
11. **Run "Get All Destinations"** to confirm the destination is no longer in the list.
