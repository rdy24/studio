import type { Destination } from "@/types";

// Type for destination creation input
export interface DestinationCreateInput {
	name: string;
	country: string;
	description?: string | null;
	imageUrl?: string | null;
}

// Type for destination update input
export interface DestinationUpdateInput {
	name: string;
	country: string;
	description?: string | null;
	imageUrl?: string | null;
}

// Fetch all destinations
export async function fetchDestinations(): Promise<{
	data: Destination[];
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
}> {
	const response = await fetch("/api/destinations");

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to fetch destinations"
		);
	}

	return await response.json();
}

// Create a new destination
export async function createDestination(
	destinationData: DestinationCreateInput
): Promise<Destination> {
	const response = await fetch("/api/destinations", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: destinationData.name,
			country: destinationData.country,
			description: destinationData.description,
			imageUrl: destinationData.imageUrl,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to create destination"
		);
	}

	return await response.json();
}

// Update an existing destination
export async function updateDestination(
	destinationId: string,
	destinationData: DestinationUpdateInput
): Promise<Destination> {
	const response = await fetch(`/api/destinations/${destinationId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: destinationData.name,
			country: destinationData.country,
			description: destinationData.description,
			imageUrl: destinationData.imageUrl,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to update destination"
		);
	}

	return await response.json();
}

// Delete a destination
export async function deleteDestination(
	destinationId: string
): Promise<boolean> {
	const response = await fetch(`/api/destinations/${destinationId}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to delete destination"
		);
	}

	return true;
}
