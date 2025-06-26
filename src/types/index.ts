export interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	roleId: string;
	status: "Active" | "Inactive" | "Pending";
	avatar?: string;
	lastLogin?: Date;
	dateJoined?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateUserRequest {
	name: string;
	email: string;
	roleId: string;
	status?: "Active" | "Inactive" | "Pending";
	avatar?: string;
}

export interface UpdateUserRequest {
	name?: string;
	email?: string;
	roleId?: string;
	status?: "Active" | "Inactive" | "Pending";
	avatar?: string;
}

export interface ApiResponse<T> {
	data: T;
	error: string | null;
	message: string;
	statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface Role {
	id: string;
	name: string;
	description: string;
	permissions: string[];
}

export interface Destination {
	id: string;
	name: string;
	country: string;
	description?: string;
	imageUrl?: string;
}

export interface Voyage {
	id: string;
	name: string;
	destinationIds: string[]; // Array of Destination IDs
	startDate?: Date;
	endDate?: Date;
	price: number;
	status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
	description?: string;
	imageUrl?: string;
}

export interface TravelSchedule {
	id: string;
	title: string;
	voyageId: string;
	startDateTime: Date;
	endDateTime: Date;
	location: string;
	description?: string;
	status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
	participants: string[]; // Array of User IDs
	notes?: string;
}

export interface MetricCardProps {
	title: string;
	value: string;
	icon: React.ElementType;
	change?: string;
	changeType?: "positive" | "negative";
	description?: string;
}
