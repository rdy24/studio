export interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	status: "Active" | "Inactive" | "Pending";
	avatar?: string;
	lastLogin?: Date;
	dateJoined?: Date;
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
	destinationIds?: string[]; // Array of Destination IDs
	destinations?: Destination[]; // Array of Destination objects (from API)
	startDate?: Date;
	endDate?: Date;
	price: number;
	status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
	description?: string;
	imageUrl?: string;
}

export interface MetricCardProps {
	title: string;
	value: string;
	icon: React.ElementType;
	change?: string;
	changeType?: "positive" | "negative";
	description?: string;
}
