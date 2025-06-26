# Bookings API Testing Guide

This guide provides comprehensive instructions for testing the Bookings CRUD API using Postman.

## Overview

The Bookings API provides complete CRUD (Create, Read, Update, Delete) functionality for managing voyage bookings in the Voyage Control system. Each booking links a user to a voyage with payment tracking, status management, and additional notes.

## Setup

### 1. Import Postman Collection

Import the Postman collection from `docs/postman-bookings-simple.json` into your Postman workspace.

### 2. Environment Variables

Set up the following environment variables in Postman:

-   `base_url`: `http://localhost:3000` (adjust port if different)
-   `booking_id`: (will be populated during testing)
-   `voyage_id`: (required for testing - get from voyages API)
-   `user_id`: (required for testing - get from users API)

### 3. Prerequisites

Before testing bookings, ensure you have:

1. At least one voyage created (use Voyages API)
2. At least one user created (use Users API)
3. The application running on the specified base URL
4. Database properly seeded with initial data

## API Endpoints

### Base Endpoints

-   `GET /api/bookings` - Get all bookings with filtering and pagination
-   `POST /api/bookings` - Create a new booking
-   `GET /api/bookings/{id}` - Get a specific booking by ID
-   `PUT /api/bookings/{id}` - Update a specific booking
-   `DELETE /api/bookings/{id}` - Delete a specific booking

## Testing Scenarios

### 1. Read Operations (GET)

#### Get All Bookings

```
GET {{base_url}}/api/bookings
```

**Expected Response:**

-   Status: 200 OK
-   Returns paginated list of bookings with voyage and user data populated
-   Default pagination: page=1, limit=10

#### Get Bookings with Pagination

```
GET {{base_url}}/api/bookings?page=1&limit=5
```

**Expected Response:**

-   Status: 200 OK
-   Returns 5 bookings maximum
-   Includes pagination metadata

#### Filter by Voyage

```
GET {{base_url}}/api/bookings?voyage_id={{voyage_id}}
```

**Expected Response:**

-   Status: 200 OK
-   Returns bookings for the specified voyage only

#### Filter by User

```
GET {{base_url}}/api/bookings?user_id={{user_id}}
```

**Expected Response:**

-   Status: 200 OK
-   Returns bookings for the specified user only

#### Filter by Status

```
GET {{base_url}}/api/bookings?status=Confirmed
```

**Expected Response:**

-   Status: 200 OK
-   Returns only bookings with "Confirmed" status
-   Valid statuses: Pending, Confirmed, Cancelled, Completed

#### Filter by Payment Status

```
GET {{base_url}}/api/bookings?payment_status=Paid
```

**Expected Response:**

-   Status: 200 OK
-   Returns only bookings with "Paid" payment status
-   Valid payment statuses: Pending, Paid, Refunded

#### Multiple Filters

```
GET {{base_url}}/api/bookings?status=Confirmed&payment_status=Paid&page=1&limit=10
```

**Expected Response:**

-   Status: 200 OK
-   Returns confirmed bookings that are paid
-   Combines multiple filter criteria

#### Get Booking by ID

```
GET {{base_url}}/api/bookings/{{booking_id}}
```

**Expected Response:**

-   Status: 200 OK
-   Returns single booking with full details including voyage and user data
-   Status: 404 if booking not found

### 2. Create Operations (POST)

#### Create Basic Booking

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "{{voyage_id}}",
  "userId": "{{user_id}}",
  "totalAmount": 1200.00,
  "status": "Pending",
  "paymentStatus": "Pending",
  "notes": "Standard booking for Parisian Dream voyage"
}
```

**Expected Response:**

-   Status: 201 Created
-   Returns created booking with generated ID and populated voyage/user data
-   bookingDate automatically set to current timestamp

#### Create Minimal Booking

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "{{voyage_id}}",
  "userId": "{{user_id}}",
  "totalAmount": 899.99
}
```

**Expected Response:**

-   Status: 201 Created
-   Uses default status "Pending" and paymentStatus "Pending"
-   Notes remain null

#### Create Confirmed Booking with Payment

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "{{voyage_id}}",
  "userId": "{{user_id}}",
  "totalAmount": 2500.00,
  "status": "Confirmed",
  "paymentStatus": "Paid",
  "notes": "Premium booking with full payment received"
}
```

**Expected Response:**

-   Status: 201 Created
-   Returns booking with confirmed status and paid payment status

#### Create Booking with Special Notes

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "{{voyage_id}}",
  "userId": "{{user_id}}",
  "totalAmount": 1500.00,
  "status": "Pending",
  "paymentStatus": "Pending",
  "notes": "Customer has dietary restrictions: vegetarian meals required. Also requested room with city view."
}
```

**Expected Response:**

-   Status: 201 Created
-   Returns booking with detailed notes stored

### 3. Update Operations (PUT)

#### Confirm Booking

```json
PUT {{base_url}}/api/bookings/{{booking_id}}
Content-Type: application/json

{
  "status": "Confirmed"
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns booking with updated status

#### Mark as Paid

```json
PUT {{base_url}}/api/bookings/{{booking_id}}
Content-Type: application/json

{
  "paymentStatus": "Paid"
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns booking with updated payment status

#### Complete Booking

```json
PUT {{base_url}}/api/bookings/{{booking_id}}
Content-Type: application/json

{
  "status": "Completed"
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns booking marked as completed

#### Cancel Booking with Refund

```json
PUT {{base_url}}/api/bookings/{{booking_id}}
Content-Type: application/json

{
  "status": "Cancelled",
  "paymentStatus": "Refunded"
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns booking with cancelled status and refunded payment

#### Add Notes

```json
PUT {{base_url}}/api/bookings/{{booking_id}}
Content-Type: application/json

{
  "notes": "Customer called to confirm special dietary requirements. Vegetarian meals arranged."
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns booking with updated notes

#### Remove Notes

```json
PUT {{base_url}}/api/bookings/{{booking_id}}
Content-Type: application/json

{
  "notes": null
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns booking with notes set to null

#### Update Multiple Fields

```json
PUT {{base_url}}/api/bookings/{{booking_id}}
Content-Type: application/json

{
  "status": "Confirmed",
  "paymentStatus": "Paid",
  "notes": "Booking confirmed and payment processed successfully"
}
```

**Expected Response:**

-   Status: 200 OK
-   Returns booking with all specified fields updated

### 4. Delete Operations (DELETE)

#### Delete Booking

```
DELETE {{base_url}}/api/bookings/{{booking_id}}
```

**Expected Response:**

-   Status: 204 No Content (successful deletion)
-   Status: 404 if booking not found

## Error Testing

### Validation Errors

#### Invalid Voyage ID

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "invalid-voyage-id",
  "userId": "{{user_id}}",
  "totalAmount": 100.00
}
```

**Expected Response:**

-   Status: 400 Bad Request
-   Error message about voyage not found

#### Invalid User ID

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "{{voyage_id}}",
  "userId": "invalid-user-id",
  "totalAmount": 100.00
}
```

**Expected Response:**

-   Status: 400 Bad Request
-   Error message about user not found

#### Missing Required Fields

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "notes": "Missing required fields"
}
```

**Expected Response:**

-   Status: 422 Validation Error
-   Error messages for missing voyageId, userId, and totalAmount

#### Invalid Total Amount

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "{{voyage_id}}",
  "userId": "{{user_id}}",
  "totalAmount": -100.00
}
```

**Expected Response:**

-   Status: 422 Validation Error
-   Error message about negative total amount

#### Invalid Status

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "{{voyage_id}}",
  "userId": "{{user_id}}",
  "totalAmount": 100.00,
  "status": "InvalidStatus"
}
```

**Expected Response:**

-   Status: 422 Validation Error
-   Error message about invalid status value

#### Invalid Payment Status

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "{{voyage_id}}",
  "userId": "{{user_id}}",
  "totalAmount": 100.00,
  "paymentStatus": "InvalidPaymentStatus"
}
```

**Expected Response:**

-   Status: 422 Validation Error
-   Error message about invalid payment status value

#### Notes Too Long

```json
POST {{base_url}}/api/bookings
Content-Type: application/json

{
  "voyageId": "{{voyage_id}}",
  "userId": "{{user_id}}",
  "totalAmount": 100.00,
  "notes": "This is a very long note that exceeds the maximum allowed length of 1000 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
}
```

**Expected Response:**

-   Status: 422 Validation Error
-   Error message about notes exceeding maximum length

### Business Logic Errors

#### Update Non-existent Booking

```json
PUT {{base_url}}/api/bookings/non-existent-id
Content-Type: application/json

{
  "status": "Confirmed"
}
```

**Expected Response:**

-   Status: 404 Not Found
-   Error message about booking not found

#### Delete Non-existent Booking

```
DELETE {{base_url}}/api/bookings/non-existent-id
```

**Expected Response:**

-   Status: 404 Not Found
-   Error message about booking not found

## Response Format

All successful responses follow this structure:

```json
{
	"data": {
		"id": "booking_id",
		"voyageId": "voyage_id",
		"userId": "user_id",
		"voyage": {
			"id": "voyage_id",
			"name": "Voyage Name",
			"description": "Voyage description",
			"startDate": "2024-09-01T00:00:00.000Z",
			"endDate": "2024-09-07T00:00:00.000Z",
			"price": 1200.0,
			"status": "Upcoming",
			"imageUrl": "image_url"
		},
		"user": {
			"id": "user_id",
			"name": "User Name",
			"email": "user@example.com",
			"status": "Active",
			"avatar": "avatar_url"
		},
		"bookingDate": "2024-01-01T00:00:00.000Z",
		"status": "Pending",
		"totalAmount": 1200.0,
		"paymentStatus": "Pending",
		"notes": "Booking notes",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	},
	"error": null,
	"message": "Success message",
	"statusCode": 200
}
```

For paginated responses (GET /api/bookings):

```json
{
	"data": {
		"data": [
			/* array of bookings */
		],
		"pagination": {
			"page": 1,
			"limit": 10,
			"total": 25,
			"totalPages": 3
		}
	},
	"error": null,
	"message": "Bookings retrieved successfully",
	"statusCode": 200
}
```

## Testing Workflow

### Recommended Testing Order

1. **Setup**: Ensure voyages and users exist
2. **Create**: Test various booking creation scenarios
3. **Read**: Test all filtering and pagination options
4. **Update**: Test status changes and note management
5. **Delete**: Test deletion (save for last as it removes data)
6. **Error Cases**: Test validation and business logic errors

### Data Management

-   Copy booking IDs from creation responses to use in subsequent tests
-   Use valid voyage and user IDs from existing data
-   Test with different voyage and user combinations
-   Clean up test data periodically to avoid conflicts

## Common Issues

1. **Voyage/User Not Found**: Ensure voyage and user IDs exist before creating bookings
2. **Amount Precision**: Use decimal values for amounts (e.g., 1200.00)
3. **Status Values**: Use exact case-sensitive status values
4. **Null vs Empty**: Use null for removing optional fields, not empty strings
5. **Date Handling**: bookingDate is automatically set on creation

## Advanced Testing

### Performance Testing

-   Test with large datasets (100+ bookings)
-   Test complex filtering combinations
-   Monitor response times for pagination

### Edge Cases

-   Very long notes (up to 1000 characters)
-   Extreme amount values (within limits)
-   Multiple bookings for same voyage/user combination
-   Booking status transitions (Pending → Confirmed → Completed)

### Business Scenarios

#### Complete Booking Lifecycle

1. Create booking with "Pending" status
2. Update to "Confirmed" status
3. Update payment status to "Paid"
4. Update status to "Completed"

#### Cancellation Workflow

1. Create booking with "Confirmed" status and "Paid" payment
2. Update to "Cancelled" status and "Refunded" payment

#### Customer Service Scenarios

1. Create booking with special notes
2. Update notes with additional customer requests
3. Track status changes through the booking lifecycle

## Integration Testing

### Cross-Module Dependencies

-   Verify voyage data is properly populated in booking responses
-   Verify user data is properly populated in booking responses
-   Test booking creation with various voyage statuses
-   Test booking creation with various user statuses

### Data Consistency

-   Ensure booking totals match voyage prices (when applicable)
-   Verify booking dates align with voyage schedules
-   Check that cancelled bookings don't affect voyage capacity

This guide covers all essential testing scenarios for the Bookings API. Follow the recommended workflow and test both success and error cases to ensure robust API functionality.
