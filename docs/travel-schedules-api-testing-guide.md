# Travel Schedules API Testing Guide

This guide provides instructions for testing the Travel Schedules CRUD operations using Postman.

## Prerequisites

1. **Import Environment**: Import `postman-environment.json` to set up base URL and other variables
2. **Import Collection**: Import `postman-travel-schedules-simple.json` for travel schedules testing
3. **Dependencies**: Ensure you have existing voyages and users in the system for testing

## Required Variables

Set these variables in your Postman environment or collection:

-   `base_url`: Your API base URL (e.g., `http://localhost:3000`)
-   `voyage_id`: ID of an existing voyage to associate with schedules
-   `user_id`: ID of an existing user to add as participant
-   `user_id_2`: ID of a second user for testing multiple participants
-   `travel_schedule_id`: Will be set from create responses for individual operations

## API Endpoints

### Base URL

```
{{base_url}}/api/travel-schedules
```

## Testing Workflow

### 1. Setup Test Data

Before testing travel schedules, ensure you have:

1. **Existing Voyage**: Create or get a voyage ID

    ```bash
    GET {{base_url}}/api/voyages
    ```

2. **Existing Users**: Create or get user IDs

    ```bash
    GET {{base_url}}/api/users
    ```

3. **Set Variables**: Update your environment with the IDs obtained above

### 2. Test CRUD Operations

#### A. Create Travel Schedule

**Request**: `POST /api/travel-schedules`

**Full Example**:

```json
{
	"title": "City Tour Paris",
	"voyageId": "{{voyage_id}}",
	"startDatetime": "2024-09-01T09:00:00Z",
	"endDatetime": "2024-09-01T17:00:00Z",
	"location": "Eiffel Tower, Paris",
	"description": "Guided tour of the iconic Eiffel Tower and surrounding areas",
	"status": "Scheduled",
	"participantIds": ["{{user_id}}"],
	"notes": "Bring comfortable walking shoes and camera"
}
```

**Minimal Example**:

```json
{
	"title": "Museum Visit",
	"voyageId": "{{voyage_id}}",
	"startDatetime": "2024-09-02T10:00:00Z",
	"endDatetime": "2024-09-02T16:00:00Z",
	"location": "Louvre Museum, Paris"
}
```

**Expected Response**:

```json
{
	"data": {
		"id": "schedule_id_here",
		"title": "City Tour Paris",
		"voyageId": "voyage_id_here",
		"voyage": {
			"id": "voyage_id_here",
			"name": "Voyage Name"
		},
		"startDatetime": "2024-09-01T09:00:00.000Z",
		"endDatetime": "2024-09-01T17:00:00.000Z",
		"location": "Eiffel Tower, Paris",
		"description": "Guided tour of the iconic Eiffel Tower and surrounding areas",
		"status": "Scheduled",
		"participantIds": ["user_id_here"],
		"participants": [
			{
				"id": "user_id_here",
				"name": "User Name",
				"email": "user@example.com"
			}
		],
		"notes": "Bring comfortable walking shoes and camera",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	},
	"error": null,
	"message": "Travel schedule created successfully",
	"status_code": 201
}
```

**Action**: Copy the `id` from the response and set it as `travel_schedule_id` variable.

#### B. Get All Travel Schedules

**Request**: `GET /api/travel-schedules?page=1&limit=10`

**Query Parameters**:

-   `page`: Page number (default: 1)
-   `limit`: Items per page (default: 10, max: 100)
-   `search`: Search in title, location, or description
-   `voyage_id`: Filter by voyage ID
-   `status`: Filter by status (Scheduled, In Progress, Completed, Cancelled)
-   `start_datetime_from`: Filter schedules starting from this datetime
-   `start_datetime_to`: Filter schedules starting before this datetime
-   `participant_id`: Filter schedules by participant user ID

**Expected Response**:

```json
{
	"data": [
		{
			"id": "schedule_id",
			"title": "City Tour Paris",
			"voyageId": "voyage_id",
			"voyage": {
				"id": "voyage_id",
				"name": "Voyage Name"
			},
			"startDatetime": "2024-09-01T09:00:00.000Z",
			"endDatetime": "2024-09-01T17:00:00.000Z",
			"location": "Eiffel Tower, Paris",
			"description": "Guided tour description",
			"status": "Scheduled",
			"participantIds": ["user_id"],
			"participants": [
				{
					"id": "user_id",
					"name": "User Name",
					"email": "user@example.com"
				}
			],
			"notes": "Tour notes",
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"pagination": {
		"page": 1,
		"limit": 10,
		"total": 1,
		"totalPages": 1
	},
	"error": null,
	"message": "Travel schedules retrieved successfully",
	"status_code": 200
}
```

#### C. Get Travel Schedule by ID

**Request**: `GET /api/travel-schedules/{{travel_schedule_id}}`

**Expected Response**: Same as create response but with status 200.

#### D. Update Travel Schedule

**Request**: `PUT /api/travel-schedules/{{travel_schedule_id}}`

**Full Update Example**:

```json
{
	"title": "Updated City Tour Paris",
	"startDatetime": "2024-09-01T08:30:00Z",
	"endDatetime": "2024-09-01T18:00:00Z",
	"location": "Eiffel Tower & Arc de Triomphe, Paris",
	"description": "Extended guided tour including Eiffel Tower and Arc de Triomphe",
	"status": "In Progress",
	"participantIds": ["{{user_id}}", "{{user_id_2}}"],
	"notes": "Updated itinerary - bring comfortable walking shoes, camera, and water bottle"
}
```

**Partial Update Example**:

```json
{
	"status": "Completed",
	"notes": "Tour completed successfully. All participants enjoyed the experience."
}
```

**Expected Response**: Updated travel schedule object with status 200.

#### E. Delete Travel Schedule

**Request**: `DELETE /api/travel-schedules/{{travel_schedule_id}}`

**Expected Response**:

```json
{
	"data": null,
	"error": null,
	"message": "Travel schedule deleted successfully",
	"status_code": 204
}
```

### 3. Advanced Filtering Tests

#### Filter by Search

```
GET /api/travel-schedules?search=tour&status=Scheduled
```

#### Filter by Voyage

```
GET /api/travel-schedules?voyage_id={{voyage_id}}
```

#### Filter by Date Range

```
GET /api/travel-schedules?start_datetime_from=2024-09-01T00:00:00Z&start_datetime_to=2024-09-30T23:59:59Z
```

#### Filter by Participant

```
GET /api/travel-schedules?participant_id={{user_id}}
```

## Data Validation Rules

### Required Fields

-   `title`: String, required
-   `voyageId`: String, required, must exist
-   `startDatetime`: DateTime, required
-   `endDatetime`: DateTime, required
-   `location`: String, required

### Optional Fields

-   `description`: String, optional
-   `status`: Enum (Scheduled, In Progress, Completed, Cancelled), default: "Scheduled"
-   `participantIds`: Array of user IDs, optional
-   `notes`: String, optional

### Business Rules

-   `endDatetime` must be after `startDatetime`
-   `voyageId` must reference an existing voyage
-   All `participantIds` must reference existing users
-   Status transitions should follow logical flow

## Error Scenarios to Test

### 1. Validation Errors

```json
{
	"title": "",
	"voyageId": "invalid_id",
	"startDatetime": "invalid_date",
	"endDatetime": "2024-09-01T08:00:00Z",
	"location": ""
}
```

### 2. Non-existent Voyage

```json
{
	"title": "Test Schedule",
	"voyageId": "non_existent_voyage_id",
	"startDatetime": "2024-09-01T09:00:00Z",
	"endDatetime": "2024-09-01T17:00:00Z",
	"location": "Test Location"
}
```

### 3. Non-existent Participants

```json
{
	"title": "Test Schedule",
	"voyageId": "{{voyage_id}}",
	"startDatetime": "2024-09-01T09:00:00Z",
	"endDatetime": "2024-09-01T17:00:00Z",
	"location": "Test Location",
	"participantIds": ["non_existent_user_id"]
}
```

### 4. Invalid Date Range

```json
{
	"title": "Test Schedule",
	"voyageId": "{{voyage_id}}",
	"startDatetime": "2024-09-01T17:00:00Z",
	"endDatetime": "2024-09-01T09:00:00Z",
	"location": "Test Location"
}
```

## Expected Error Responses

### 400 Bad Request

```json
{
	"data": null,
	"error": "Validation error message",
	"message": "Failed to create/update travel schedule",
	"status_code": 400
}
```

### 404 Not Found

```json
{
	"data": null,
	"error": "Travel schedule not found",
	"message": "The requested travel schedule could not be found",
	"status_code": 404
}
```

### 500 Internal Server Error

```json
{
	"data": null,
	"error": "Internal server error",
	"message": "Failed to process request",
	"status_code": 500
}
```

## Testing Checklist

-   [ ] Create travel schedule with all fields
-   [ ] Create travel schedule with minimal fields
-   [ ] Get all travel schedules with pagination
-   [ ] Get travel schedules with search filter
-   [ ] Get travel schedules by voyage
-   [ ] Get travel schedules by date range
-   [ ] Get travel schedules by participant
-   [ ] Get travel schedule by ID
-   [ ] Update travel schedule (full)
-   [ ] Update travel schedule (partial)
-   [ ] Delete travel schedule
-   [ ] Test validation errors
-   [ ] Test non-existent references
-   [ ] Test invalid date ranges
-   [ ] Verify participant management
-   [ ] Test status transitions

## Notes

1. **DateTime Format**: Use ISO 8601 format with timezone (e.g., "2024-09-01T09:00:00Z")
2. **Participant Management**: Participants are managed through the `participantIds` array
3. **Voyage Association**: Each schedule must be associated with an existing voyage
4. **Status Management**: Status should follow logical progression (Scheduled → In Progress → Completed/Cancelled)
5. **Search Functionality**: Search works across title, location, and description fields
6. **Date Filtering**: Use precise datetime strings for accurate filtering
