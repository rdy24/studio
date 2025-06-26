# Voyages API Testing Guide

This guide provides comprehensive instructions for testing the Voyages CRUD API using Postman.

## Overview

The Voyages API provides complete CRUD (Create, Read, Update, Delete) functionality for managing travel voyages in the Voyage Control system. Each voyage can have multiple destinations, dates, pricing, and status tracking.

## Setup

### 1. Import Postman Collection

Import the Postman collection from `docs/postman-voyages-simple.json` into your Postman workspace.

### 2. Environment Variables

Set up the following environment variables in Postman:

-   `base_url`: `http://localhost:3000` (adjust port if different)
-   `voyage_id`: (will be populated during testing)
-   `destination_id`: (required for testing - get from destinations API)
-   `destination_id_2`: (optional for multi-destination testing)
-   `destination_id_3`: (optional for extended multi-destination testing)

### 3. Prerequisites

Before testing voyages, ensure you have:

1. At least one destination created (use Destinations API)
2. The application running on the specified base URL
3. Database properly seeded with initial data

## API Endpoints

### Base Endpoints

-   `GET /api/voyages` - Get all voyages with filtering and pagination
-   `POST /api/voyages` - Create a new voyage
-   `GET /api/voyages/{id}` - Get a specific voyage by ID
-   `PUT /api/voyages/{id}` - Update a specific voyage
-   `DELETE /api/voyages/{id}` - Delete a specific voyage

## Testing Scenarios

### 1. Read Operations (GET)

#### Get All Voyages

```
GET {{base_url}}/api/voyages
```

**Expected Response:**

-   Status: 200 OK
-   Returns paginated list of voyages with destinations populated
-   Default pagination: page=1, limit=10

#### Get Voyages with Pagination

```
GET {{base_url}}/api/voyages?page=1&limit=5
```

**Expected Response:**

-   Status: 200 OK
-   Returns 5 voyages maximum
-   Includes pagination metadata

#### Search Voyages

```
GET {{base_url}}/api/voyages?search=paris
```

**Expected Response:**

-   Status: 200 OK
-   Returns voyages matching "paris" in name or description

#### Filter by Status

```
GET {{base_url}}/api/voyages?status=Upcoming
```

**Expected Response:**

-   Status: 200 OK
-   Returns only voyages with "Upcoming" status
-   Valid statuses: Upcoming, Ongoing, Completed, Cancelled

#### Filter by Destination

```
GET {{base_url}}/api/voyages?destination_id={{destination_id}}
```

**Expected Response:**

-   Status: 200 OK
-   Returns voyages that include the specified destination

#### Filter by Price Range

```
GET {{base_url}}/api/voyages?price_min=500&price_max=2000
```

**Expected Response:**

-   Status: 200 OK
-   Returns voyages with price between $500 and $2000

#### Filter by Date Range

```
GET {{base_url}}/api/voyages?start_date_from=2024-09-01&start_date_to=2024-12-31
```

**Expected Response:**

-   Status: 200 OK
-   Returns voyages starting between specified dates

#### Get Voyage by ID

```
GET {{base_url}}/api/voyages/{{voyage_id}}
```

**Expected Response:**

-   Status: 200 OK
-   Returns single voyage with full details including destinations
-   Status: 404 if voyage not found

### 2. Create Operations (POST)

#### Create Basic Voyage

```json
POST {{base_url}}/api/voyages
Content-Type: application/json

{
  "name": "Parisian Dream",
  "description": "Explore the romantic city of Paris with guided tours and cultural experiences",
  "destinationIds": ["{{destination_id}}"],
  "startDate": "2024-09-01",
  "endDate": "2024-09-07",
  "price": 1200.00,
  "status": "Upcoming",
  "imageUrl": "https://placehold.co/600x400.png"
}
```

**Expected Response:**

-   Status: 201 Created
-   Returns created voyage with generated ID and populated destinations

#### Create Multi-Destination Voyage

```json
POST {{base_url}}/api/voyages
Content-Type: application/json

{
  "name": "European Grand Tour",
  "description": "A comprehensive tour through multiple European capitals",
  "destinationIds": ["{{destination_id}}", "{{destination_id_2}}"],
  "startDate": "2024-10-15",
  "endDate": "2024-10-30",
  "price": 2500.00,
  "status": "Upcoming",
  "imageUrl": "https://placehold.co/600x400.png"
}
```

**Expected Response:**

-   Status: 201 Created
-   Returns voyage with multiple destinations in sequence order

#### Create Minimal Voyage

```json
POST {{base_url}}/api/voyages
Content-Type: application/json

{
  "name": "Weekend Getaway",
  "destinationIds": ["{{destination_id}}"],
  "price": 299.99
}
```

**Expected Response:**

-   Status: 201 Created
-   Uses default status "Upcoming"
-   Optional fields remain null/empty

#### Create Voyage Without Dates

```json
POST {{base_url}}/api/voyages
Content-Type: application/json

{
  "name": "Flexible Adventure",
  "description": "A flexible travel package with dates to be determined",
  "destinationIds": ["{{destination_id}}"],
  "price": 899.00,
  "status": "Upcoming"
}
```

**Expected Response:**

-   Status: 201 Created
-   startDate and endDate remain null

### 3. Update Operations (PUT)

#### Update Name and Description

```json
PUT {{base_url}}/api/voyages/{{voyage_id}}
Content-Type: application/json

{
  "name": "Ultimate Parisian Experience",
  "description": "An enhanced Parisian experience with exclusive access to premium attractions"
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns updated voyage with new name and description

#### Update Price and Status

```json
PUT {{base_url}}/api/voyages/{{voyage_id}}
Content-Type: application/json

{
  "price": 1350.00,
  "status": "Ongoing"
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns voyage with updated price and status

#### Update Dates

```json
PUT {{base_url}}/api/voyages/{{voyage_id}}
Content-Type: application/json

{
  "startDate": "2024-09-15",
  "endDate": "2024-09-22"
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns voyage with updated dates

#### Update Destinations

```json
PUT {{base_url}}/api/voyages/{{voyage_id}}
Content-Type: application/json

{
  "destinationIds": ["{{destination_id}}", "{{destination_id_2}}", "{{destination_id_3}}"]
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns voyage with updated destination list in new sequence order

#### Remove Dates

```json
PUT {{base_url}}/api/voyages/{{voyage_id}}
Content-Type: application/json

{
  "startDate": null,
  "endDate": null
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns voyage with dates set to null

### 4. Delete Operations (DELETE)

#### Delete Voyage

```
DELETE {{base_url}}/api/voyages/{{voyage_id}}
```

**Expected Response:**

-   Status: 204 No Content (successful deletion)
-   Status: 404 if voyage not found
-   Status: 409 if voyage has existing bookings

## Error Testing

### Validation Errors

#### Invalid Destination IDs

```json
POST {{base_url}}/api/voyages
Content-Type: application/json

{
  "name": "Invalid Voyage",
  "destinationIds": ["invalid-id"],
  "price": 100.00
}
```

**Expected Response:**

-   Status: 400 Bad Request
-   Error message about non-existent destinations

#### Invalid Date Range

```json
POST {{base_url}}/api/voyages
Content-Type: application/json

{
  "name": "Invalid Dates",
  "destinationIds": ["{{destination_id}}"],
  "startDate": "2024-09-15",
  "endDate": "2024-09-01",
  "price": 100.00
}
```

**Expected Response:**

-   Status: 422 Validation Error
-   Error message about end date being before start date

#### Missing Required Fields

```json
POST {{base_url}}/api/voyages
Content-Type: application/json

{
  "description": "Missing required fields"
}
```

**Expected Response:**

-   Status: 422 Validation Error
-   Error messages for missing name, destinationIds, and price

#### Invalid Price

```json
POST {{base_url}}/api/voyages
Content-Type: application/json

{
  "name": "Invalid Price",
  "destinationIds": ["{{destination_id}}"],
  "price": -100.00
}
```

**Expected Response:**

-   Status: 422 Validation Error
-   Error message about negative price

#### Invalid Status

```json
POST {{base_url}}/api/voyages
Content-Type: application/json

{
  "name": "Invalid Status",
  "destinationIds": ["{{destination_id}}"],
  "price": 100.00,
  "status": "InvalidStatus"
}
```

**Expected Response:**

-   Status: 422 Validation Error
-   Error message about invalid status value

### Business Logic Errors

#### Delete Voyage with Bookings

```
DELETE {{base_url}}/api/voyages/{{voyage_id_with_bookings}}
```

**Expected Response:**

-   Status: 409 Conflict
-   Error message about existing bookings

#### Update Non-existent Voyage

```json
PUT {{base_url}}/api/voyages/non-existent-id
Content-Type: application/json

{
  "name": "Updated Name"
}
```

**Expected Response:**

-   Status: 404 Not Found
-   Error message about voyage not found

## Response Format

All successful responses follow this structure:

```json
{
	"data": {
		"id": "voyage_id",
		"name": "Voyage Name",
		"description": "Voyage description",
		"destinationIds": ["dest_id_1", "dest_id_2"],
		"destinations": [
			{
				"id": "dest_id_1",
				"name": "Destination Name",
				"country": "Country",
				"description": "Description",
				"imageUrl": "image_url"
			}
		],
		"startDate": "2024-09-01T00:00:00.000Z",
		"endDate": "2024-09-07T00:00:00.000Z",
		"price": 1200.0,
		"status": "Upcoming",
		"imageUrl": "image_url",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	},
	"error": null,
	"message": "Success message",
	"statusCode": 200
}
```

For paginated responses (GET /api/voyages):

```json
{
	"data": {
		"data": [
			/* array of voyages */
		],
		"pagination": {
			"page": 1,
			"limit": 10,
			"total": 25,
			"totalPages": 3
		}
	},
	"error": null,
	"message": "Voyages retrieved successfully",
	"statusCode": 200
}
```

## Testing Workflow

### Recommended Testing Order

1. **Setup**: Ensure destinations exist
2. **Create**: Test various voyage creation scenarios
3. **Read**: Test all filtering and pagination options
4. **Update**: Test partial and complete updates
5. **Delete**: Test deletion (save for last as it removes data)
6. **Error Cases**: Test validation and business logic errors

### Data Management

-   Copy voyage IDs from creation responses to use in subsequent tests
-   Use different destination IDs for multi-destination testing
-   Clean up test data periodically to avoid conflicts

## Common Issues

1. **Destination Not Found**: Ensure destination IDs exist before creating voyages
2. **Date Format**: Use ISO date format (YYYY-MM-DD) for date fields
3. **Price Precision**: Use decimal values for prices (e.g., 1200.00)
4. **Status Values**: Use exact case-sensitive status values
5. **Null vs Empty**: Use null for removing optional fields, not empty strings

## Advanced Testing

### Performance Testing

-   Test with large datasets (100+ voyages)
-   Test complex filtering combinations
-   Monitor response times for pagination

### Edge Cases

-   Very long voyage names and descriptions
-   Maximum number of destinations (10)
-   Extreme price values (within limits)
-   Date edge cases (same start/end date)

This guide covers all essential testing scenarios for the Voyages API. Follow the recommended workflow and test both success and error cases to ensure robust API functionality.
