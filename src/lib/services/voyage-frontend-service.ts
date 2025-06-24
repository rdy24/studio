import type { Voyage, Destination } from "@/types";

// Type for voyage creation input
export interface VoyageCreateInput {
	name: string;
	start_date: string | null;
	end_date: string | null;
	price: number;
	status: string;
	description: string | null;
	image_url: string | null;
	destination_ids: number[];
}

// Type for voyage update input
export interface VoyageUpdateInput {
	name?: string;
	start_date?: string | null;
	end_date?: string | null;
	price?: number;
	status?: string;
	description?: string | null;
	image_url?: string | null;
	destination_ids?: number[];
}

// Fetch all voyages
export async function fetchVoyages(params?: {
	search?: string;
	status?: string;
	destinationId?: number;
	page?: number;
	perPage?: number;
}): Promise<{
	data: Voyage[];
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
}> {
	// Build query string from params
	const queryParams = new URLSearchParams();

	if (params?.search) {
		queryParams.append("search", params.search);
	}

	if (params?.status) {
		queryParams.append("status", params.status);
	}

	if (params?.destinationId) {
		queryParams.append("destinationId", params.destinationId.toString());
	}

	if (params?.page) {
		queryParams.append("page", params.page.toString());
	}

	if (params?.perPage) {
		queryParams.append("per_page", params.perPage.toString());
	}

	const queryString = queryParams.toString();
	const url = `/api/voyages${queryString ? `?${queryString}` : ""}`;

	const response = await fetch(url);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to fetch voyages"
		);
	}

	return await response.json();
}

// Fetch a single voyage by ID
export async function fetchVoyageById(voyageId: string): Promise<Voyage> {
	const response = await fetch(`/api/voyages/${voyageId}`);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to fetch voyage"
		);
	}

	return await response.json();
}

// Create a new voyage
export async function createVoyage(
	voyageData: VoyageCreateInput
): Promise<Voyage> {
	const response = await fetch("/api/voyages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(voyageData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to create voyage"
		);
	}

	return await response.json();
}

// Update an existing voyage
export async function updateVoyage(
	voyageId: string,
	voyageData: VoyageUpdateInput
): Promise<Voyage> {
	const response = await fetch(`/api/voyages/${voyageId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(voyageData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to update voyage"
		);
	}

	return await response.json();
}

// Delete a voyage
export async function deleteVoyage(voyageId: string): Promise<boolean> {
	const response = await fetch(`/api/voyages/${voyageId}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to delete voyage"
		);
	}

	return true;
}
