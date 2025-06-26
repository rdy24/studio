# Roles API Testing Guide

## Overview

This guide provides comprehensive testing instructions for the Roles CRUD API endpoints. The API supports full CRUD operations with pagination, search, and permission management.

## Base URL

```
http://localhost:9002
```

## Environment Setup

### Postman Environment Variables

Create a Postman environment with the following variables:

```json
{
	"base_url": "http://localhost:9002",
	"role_id": ""
}
```

### Import Collection

Import the Postman collection from: `docs/postman-roles-simple.json`

## API Endpoints

### 1. GET /api/roles - Get All Roles

**Description:** Retrieve all roles with optional pagination and search

**Query Parameters:**

-   `page` (optional): Page number (default: 1)
-   `limit` (optional): Items per page (default: 10, max: 100)
-   `search` (optional): Search term for role name or description

**Test Cases:**

#### Basic Request

```
GET {{base_url}}/api/roles
```

**Expected Response:**

```json
{
	"data": {
		"data": [
			{
				"id": "role_id_here",
				"name": "Administrator",
				"description": "Full access to all system features",
				"permissions": [
					"manage_users",
					"manage_roles",
					"manage_voyages"
				],
				"createdAt": "2024-01-01T00:00:00.000Z",
				"updatedAt": "2024-01-01T00:00:00.000Z"
			}
		],
		"pagination": {
			"page": 1,
			"limit": 10,
			"total": 1,
			"totalPages": 1
		}
	},
	"error": null,
	"message": "Roles retrieved successfully",
	"statusCode": 200
}
```

#### With Pagination

```
GET {{base_url}}/api/roles?page=1&limit=5
```

#### With Search

```
GET {{base_url}}/api/roles?search=admin
```

### 2. GET /api/roles/{id} - Get Role by ID

**Description:** Retrieve a specific role by its ID

**Test Cases:**

#### Valid Role ID

```
GET {{base_url}}/api/roles/{{role_id}}
```

**Expected Response:**

```json
{
	"data": {
		"id": "role_id_here",
		"name": "Administrator",
		"description": "Full access to all system features",
		"permissions": ["manage_users", "manage_roles"],
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	},
	"error": null,
	"message": "Role retrieved successfully",
	"statusCode": 200
}
```

#### Invalid Role ID

```
GET {{base_url}}/api/roles/invalid_id
```

**Expected Response:**

```json
{
	"data": null,
	"error": "Role not found",
	"message": "The specified role does not exist",
	"statusCode": 404
}
```

### 3. POST /api/roles - Create Role

**Description:** Create a new role with permissions

**Request Body Schema:**

```json
{
	"name": "string (required, 1-100 chars)",
	"description": "string (optional, max 500 chars)",
	"permissions": ["array of valid permission strings (optional)"]
}
```

**Valid Permissions:**

-   `manage_users`
-   `manage_roles`
-   `manage_voyages`
-   `manage_destinations`
-   `manage_bookings`
-   `manage_schedules`
-   `view_reports`
-   `view_bookings`
-   `manage_support_tickets`

**Test Cases:**

#### Create Basic Role

```json
POST {{base_url}}/api/roles
Content-Type: application/json

{
  "name": "Travel Agent",
  "description": "Manages voyages and bookings",
  "permissions": ["manage_voyages", "view_bookings"]
}
```

#### Create Administrator Role

```json
POST {{base_url}}/api/roles
Content-Type: application/json

{
  "name": "Administrator",
  "description": "Full access to all system features",
  "permissions": [
    "manage_users",
    "manage_roles",
    "manage_voyages",
    "manage_destinations",
    "manage_bookings",
    "manage_schedules",
    "view_reports",
    "view_bookings",
    "manage_support_tickets"
  ]
}
```

#### Create Role Without Permissions

```json
POST {{base_url}}/api/roles
Content-Type: application/json

{
  "name": "Guest",
  "description": "Limited access role",
  "permissions": []
}
```

**Expected Success Response:**

```json
{
	"data": {
		"id": "new_role_id",
		"name": "Travel Agent",
		"description": "Manages voyages and bookings",
		"permissions": ["manage_voyages", "view_bookings"],
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	},
	"error": null,
	"message": "Role created successfully",
	"statusCode": 201
}
```

#### Validation Error Cases

**Duplicate Role Name:**

```json
{
	"data": null,
	"error": "Role name already exists",
	"message": "A role with this name already exists",
	"statusCode": 409
}
```

**Invalid Permission:**

```json
POST {{base_url}}/api/roles
Content-Type: application/json

{
  "name": "Test Role",
  "permissions": ["invalid_permission"]
}
```

**Expected Response:**

```json
{
	"data": null,
	"error": "Validation failed",
	"message": "Invalid permission provided",
	"statusCode": 422
}
```

### 4. PUT /api/roles/{id} - Update Role

**Description:** Update an existing role

**Request Body Schema:** (All fields optional)

```json
{
	"name": "string (optional, 1-100 chars)",
	"description": "string (optional, max 500 chars)",
	"permissions": ["array of valid permission strings (optional)"]
}
```

**Test Cases:**

#### Update Name and Description

```json
PUT {{base_url}}/api/roles/{{role_id}}
Content-Type: application/json

{
  "name": "Senior Travel Agent",
  "description": "Senior level travel agent with extended permissions"
}
```

#### Update Permissions Only

```json
PUT {{base_url}}/api/roles/{{role_id}}
Content-Type: application/json

{
  "permissions": ["manage_voyages", "manage_destinations", "view_bookings", "view_reports"]
}
```

#### Remove All Permissions

```json
PUT {{base_url}}/api/roles/{{role_id}}
Content-Type: application/json

{
  "permissions": []
}
```

**Expected Success Response:**

```json
{
	"data": {
		"id": "role_id",
		"name": "Senior Travel Agent",
		"description": "Senior level travel agent with extended permissions",
		"permissions": ["manage_voyages", "view_bookings"],
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	},
	"error": null,
	"message": "Role updated successfully",
	"statusCode": 200
}
```

#### Error Cases

**Role Not Found:**

```json
{
	"data": null,
	"error": "Role not found",
	"message": "The specified role does not exist",
	"statusCode": 404
}
```

**Duplicate Name:**

```json
{
	"data": null,
	"error": "Role name already exists",
	"message": "A role with this name already exists",
	"statusCode": 409
}
```

### 5. DELETE /api/roles/{id} - Delete Role

**Description:** Delete a role (only if not assigned to any users)

**Test Cases:**

#### Successful Deletion

```
DELETE {{base_url}}/api/roles/{{role_id}}
```

**Expected Response:**

-   Status Code: 204 (No Content)
-   Empty response body

#### Error Cases

**Role Not Found:**

```json
{
	"data": null,
	"error": "Role not found",
	"message": "The specified role does not exist",
	"statusCode": 404
}
```

**Role Assigned to Users:**

```json
{
	"data": null,
	"error": "Role cannot be deleted",
	"message": "This role is assigned to users and cannot be deleted",
	"statusCode": 409
}
```

## Testing Workflow

### 1. Setup Test Data

**Note:** The database already contains seeded roles. Here are the current role IDs you can use for testing:

-   **Administrator**: `cmcdhfm800009m13h4n2fn1qp`
-   **Travel Agent**: `cmcdhfm8t000am13hjd1sr0qm`
-   **Customer**: `cmcdhfm9g000bm13hjed9mjud`

1. **Set Role ID Variable:** In Postman, set the `role_id` variable to one of the above IDs

2. **Or Create New Roles for Testing:**

    ```json
    POST /api/roles
    {
      "name": "Test Administrator",
      "description": "Full system access for testing",
      "permissions": ["manage_users", "manage_roles", "manage_voyages"]
    }
    ```

3. **Save New Role IDs:** Copy the `id` from responses and set as `role_id` variable

### 2. Test CRUD Operations

1. **Read Operations:**

    - Get all roles
    - Get role by ID
    - Test pagination
    - Test search functionality

2. **Update Operations:**

    - Update role name
    - Update permissions
    - Test validation errors

3. **Delete Operations:**
    - Delete unused role
    - Test deletion of role assigned to users

### 3. Validation Testing

1. **Test Required Fields:**

    - Missing name
    - Empty name
    - Name too long

2. **Test Permission Validation:**

    - Invalid permission names
    - Empty permissions array

3. **Test Business Rules:**
    - Duplicate role names
    - Deleting assigned roles

## Common Error Responses

### 400 - Bad Request

```json
{
	"data": null,
	"error": "Invalid permissions",
	"message": "The following permissions do not exist: invalid_permission",
	"statusCode": 400
}
```

### 404 - Not Found

```json
{
	"data": null,
	"error": "Role not found",
	"message": "The specified role does not exist",
	"statusCode": 404
}
```

### 409 - Conflict

```json
{
	"data": null,
	"error": "Role name already exists",
	"message": "A role with this name already exists",
	"statusCode": 409
}
```

### 422 - Validation Error

```json
{
	"data": null,
	"error": "Validation failed",
	"message": "Role name is required",
	"details": [
		{
			"field": "name",
			"message": "Role name is required"
		}
	],
	"statusCode": 422
}
```

### 500 - Internal Server Error

```json
{
	"data": null,
	"error": "Internal server error",
	"message": "Failed to create role",
	"statusCode": 500
}
```

## Notes

1. **Permission System:** The API validates permissions against a predefined list. Invalid permissions will result in validation errors.

2. **Role Dependencies:** Roles cannot be deleted if they are assigned to users. This prevents data integrity issues.

3. **Search Functionality:** Search works on both role name and description fields with case-insensitive matching.

4. **Pagination:** Default page size is 10, maximum is 100 items per page.

5. **Timestamps:** All roles include `createdAt` and `updatedAt` timestamps in ISO 8601 format.
