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
	description: string | null;
	permissions: string[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface Destination {
	id: string;
	name: string;
	country: string;
	description?: string;
	imageUrl?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateDestinationRequest {
	name: string;
	country: string;
	description?: string;
	imageUrl?: string;
}

export interface UpdateDestinationRequest {
	name?: string;
	country?: string;
	description?: string;
	imageUrl?: string;
}

export interface Voyage {
	id: string;
	name: string;
	destinationIds: string[]; // Array of Destination IDs
	destinations?: Destination[]; // Populated destinations for API responses
	startDate?: Date;
	endDate?: Date;
	price: number;
	status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
	description?: string;
	imageUrl?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateVoyageRequest {
	name: string;
	description?: string;
	destinationIds: string[];
	startDate?: string; // ISO date string
	endDate?: string; // ISO date string
	price: number;
	status?: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
	imageUrl?: string;
}

export interface UpdateVoyageRequest {
	name?: string;
	description?: string;
	destinationIds?: string[];
	startDate?: string; // ISO date string
	endDate?: string; // ISO date string
	price?: number;
	status?: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
	imageUrl?: string;
}

export interface TravelSchedule {
	id: string;
	title: string;
	voyageId: string;
	startDatetime: Date;
	endDatetime: Date;
	location: string;
	description?: string;
	status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
	participantIds: string[]; // Array of User IDs
	notes?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateTravelScheduleRequest {
	title: string;
	voyageId: string;
	startDatetime: string; // ISO datetime string
	endDatetime: string; // ISO datetime string
	location: string;
	description?: string;
	status?: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
	participantIds?: string[];
	notes?: string;
}

export interface UpdateTravelScheduleRequest {
	title?: string;
	voyageId?: string;
	startDatetime?: string; // ISO datetime string
	endDatetime?: string; // ISO datetime string
	location?: string;
	description?: string;
	status?: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
	participantIds?: string[];
	notes?: string;
}

export interface Booking {
	id: string;
	voyageId: string;
	userId: string;
	voyage?: Voyage; // Populated voyage for API responses
	user?: User; // Populated user for API responses
	bookingDate: Date;
	status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
	totalAmount: number;
	paymentStatus: "Pending" | "Paid" | "Refunded";
	notes?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateBookingRequest {
	voyageId: string;
	userId: string;
	totalAmount: number;
	status?: "Pending" | "Confirmed" | "Cancelled" | "Completed";
	paymentStatus?: "Pending" | "Paid" | "Refunded";
	notes?: string;
}

export interface UpdateBookingRequest {
	status?: "Pending" | "Confirmed" | "Cancelled" | "Completed";
	paymentStatus?: "Pending" | "Paid" | "Refunded";
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
