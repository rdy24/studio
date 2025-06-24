import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	console.log("Start seeding...");

	// Clear existing data
	await clearDatabase();

	// Seed permissions
	const permissions = await seedPermissions();
	console.log("Permissions seeded successfully");

	// Seed roles
	const roles = await seedRoles(permissions);
	console.log("Roles seeded successfully");

	// Seed users
	const users = await seedUsers(roles);
	console.log("Users seeded successfully");

	// Seed destinations
	const destinations = await seedDestinations();
	console.log("Destinations seeded successfully");

	// Seed voyages
	const voyages = await seedVoyages(destinations);
	console.log("Voyages seeded successfully");

	// Seed bookings
	await seedBookings(voyages, users);
	console.log("Bookings seeded successfully");

	// Seed support tickets
	await seedSupportTickets(users);
	console.log("Support tickets seeded successfully");

	console.log("Seeding completed successfully");
}

async function clearDatabase() {
	// Delete all records in reverse order of dependencies
	await prisma.ticketResponse.deleteMany();
	await prisma.supportTicket.deleteMany();
	await prisma.activityLog.deleteMany();
	await prisma.booking.deleteMany();
	await prisma.voyageDestination.deleteMany();
	await prisma.voyage.deleteMany();
	await prisma.destination.deleteMany();
	await prisma.user.deleteMany();
	await prisma.rolePermission.deleteMany();
	await prisma.role.deleteMany();
	await prisma.permission.deleteMany();
}

async function seedPermissions() {
	const permissionsData = [
		{ name: "user:read", description: "Can view user information" },
		{ name: "user:create", description: "Can create new users" },
		{ name: "user:update", description: "Can update user information" },
		{ name: "user:delete", description: "Can delete users" },
		{ name: "role:read", description: "Can view role information" },
		{ name: "role:create", description: "Can create new roles" },
		{ name: "role:update", description: "Can update role information" },
		{ name: "role:delete", description: "Can delete roles" },
		{
			name: "destination:read",
			description: "Can view destination information",
		},
		{
			name: "destination:create",
			description: "Can create new destinations",
		},
		{
			name: "destination:update",
			description: "Can update destination information",
		},
		{ name: "destination:delete", description: "Can delete destinations" },
		{ name: "voyage:read", description: "Can view voyage information" },
		{ name: "voyage:create", description: "Can create new voyages" },
		{ name: "voyage:update", description: "Can update voyage information" },
		{ name: "voyage:delete", description: "Can delete voyages" },
		{ name: "booking:read", description: "Can view booking information" },
		{ name: "booking:create", description: "Can create new bookings" },
		{
			name: "booking:update",
			description: "Can update booking information",
		},
		{ name: "booking:delete", description: "Can delete bookings" },
		{
			name: "ticket:read",
			description: "Can view support ticket information",
		},
		{
			name: "ticket:create",
			description: "Can create new support tickets",
		},
		{
			name: "ticket:update",
			description: "Can update support ticket information",
		},
		{ name: "ticket:delete", description: "Can delete support tickets" },
		{
			name: "ticket:assign",
			description: "Can assign support tickets to staff",
		},
		{
			name: "ticket:respond",
			description: "Can respond to support tickets",
		},
	];

	const permissions = [];
	for (const permissionData of permissionsData) {
		const permission = await prisma.permission.create({
			data: permissionData,
		});
		permissions.push(permission);
	}

	return permissions;
}

async function seedRoles(permissions: any[]) {
	// Create admin role with all permissions
	const adminRole = await prisma.role.create({
		data: {
			name: "Administrator",
			description: "Full system access",
		},
	});

	// Assign all permissions to admin role
	for (const permission of permissions) {
		await prisma.rolePermission.create({
			data: {
				roleId: adminRole.id,
				permissionId: permission.id,
			},
		});
	}

	// Create travel agent role with limited permissions
	const travelAgentRole = await prisma.role.create({
		data: {
			name: "Travel Agent",
			description: "Manages voyages and bookings",
		},
	});

	// Assign specific permissions to travel agent role
	const travelAgentPermissions = [
		"user:read",
		"destination:read",
		"voyage:read",
		"voyage:create",
		"voyage:update",
		"booking:read",
		"booking:create",
		"booking:update",
		"ticket:read",
		"ticket:create",
		"ticket:respond",
	];

	for (const permissionName of travelAgentPermissions) {
		const permission = permissions.find((p) => p.name === permissionName);
		if (permission) {
			await prisma.rolePermission.create({
				data: {
					roleId: travelAgentRole.id,
					permissionId: permission.id,
				},
			});
		}
	}

	// Create support staff role
	const supportStaffRole = await prisma.role.create({
		data: {
			name: "Support Staff",
			description: "Handles support tickets",
		},
	});

	// Assign specific permissions to support staff role
	const supportStaffPermissions = [
		"user:read",
		"destination:read",
		"voyage:read",
		"booking:read",
		"ticket:read",
		"ticket:update",
		"ticket:respond",
	];

	for (const permissionName of supportStaffPermissions) {
		const permission = permissions.find((p) => p.name === permissionName);
		if (permission) {
			await prisma.rolePermission.create({
				data: {
					roleId: supportStaffRole.id,
					permissionId: permission.id,
				},
			});
		}
	}

	// Create customer role
	const customerRole = await prisma.role.create({
		data: {
			name: "Customer",
			description: "Regular user who can book voyages",
		},
	});

	// Assign specific permissions to customer role
	const customerPermissions = [
		"destination:read",
		"voyage:read",
		"booking:read",
		"booking:create",
		"ticket:read",
		"ticket:create",
	];

	for (const permissionName of customerPermissions) {
		const permission = permissions.find((p) => p.name === permissionName);
		if (permission) {
			await prisma.rolePermission.create({
				data: {
					roleId: customerRole.id,
					permissionId: permission.id,
				},
			});
		}
	}

	return [adminRole, travelAgentRole, supportStaffRole, customerRole];
}

async function seedUsers(roles: any[]) {
	const [adminRole, travelAgentRole, supportStaffRole, customerRole] = roles;

	// Create admin user
	const adminUser = await prisma.user.create({
		data: {
			name: "Admin User",
			email: "admin@example.com",
			passwordHash: hashSync("password123", 10),
			roleId: adminRole.id,
			status: "Active",
			dateJoined: new Date(),
		},
	});

	// Create travel agent user
	const travelAgentUser = await prisma.user.create({
		data: {
			name: "Travel Agent",
			email: "agent@example.com",
			passwordHash: hashSync("password123", 10),
			roleId: travelAgentRole.id,
			status: "Active",
			dateJoined: new Date(),
		},
	});

	// Create support staff user
	const supportStaffUser = await prisma.user.create({
		data: {
			name: "Support Staff",
			email: "support@example.com",
			passwordHash: hashSync("password123", 10),
			roleId: supportStaffRole.id,
			status: "Active",
			dateJoined: new Date(),
		},
	});

	// Create customer users
	const customer1 = await prisma.user.create({
		data: {
			name: "John Doe",
			email: "john@example.com",
			passwordHash: hashSync("password123", 10),
			roleId: customerRole.id,
			status: "Active",
			dateJoined: new Date(),
		},
	});

	const customer2 = await prisma.user.create({
		data: {
			name: "Jane Smith",
			email: "jane@example.com",
			passwordHash: hashSync("password123", 10),
			roleId: customerRole.id,
			status: "Active",
			dateJoined: new Date(),
		},
	});

	return [adminUser, travelAgentUser, supportStaffUser, customer1, customer2];
}

async function seedDestinations() {
	const destinationsData = [
		{
			name: "Bali",
			country: "Indonesia",
			description:
				"Beautiful island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.",
			imageUrl: "https://example.com/images/bali.jpg",
		},
		{
			name: "Tokyo",
			country: "Japan",
			description:
				"Japan's busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.",
			imageUrl: "https://example.com/images/tokyo.jpg",
		},
		{
			name: "Paris",
			country: "France",
			description:
				"France's capital, is a major European city and a global center for art, fashion, gastronomy and culture.",
			imageUrl: "https://example.com/images/paris.jpg",
		},
		{
			name: "New York",
			country: "United States",
			description:
				"Bustling city known for its iconic skyscrapers, Broadway shows, and diverse culture.",
			imageUrl: "https://example.com/images/newyork.jpg",
		},
		{
			name: "Sydney",
			country: "Australia",
			description:
				"Famous for its Sydney Opera House, with a distinctive sail-like design, and beautiful harbor.",
			imageUrl: "https://example.com/images/sydney.jpg",
		},
	];

	const destinations = [];
	for (const destinationData of destinationsData) {
		const destination = await prisma.destination.create({
			data: destinationData,
		});
		destinations.push(destination);
	}

	return destinations;
}

async function seedVoyages(destinations: any[]) {
	const [bali, tokyo, paris, newYork, sydney] = destinations;

	// Create voyages
	const voyage1 = await prisma.voyage.create({
		data: {
			name: "Asian Adventure",
			startDate: new Date("2025-07-15"),
			endDate: new Date("2025-07-30"),
			price: 2500,
			status: "Upcoming",
			description: "Explore the beautiful destinations of Asia",
			imageUrl: "https://example.com/images/asian-adventure.jpg",
		},
	});

	// Add destinations to voyage1
	await prisma.voyageDestination.create({
		data: {
			voyageId: voyage1.id,
			destinationId: bali.id,
			orderIndex: 1,
		},
	});

	await prisma.voyageDestination.create({
		data: {
			voyageId: voyage1.id,
			destinationId: tokyo.id,
			orderIndex: 2,
		},
	});

	const voyage2 = await prisma.voyage.create({
		data: {
			name: "European Getaway",
			startDate: new Date("2025-08-10"),
			endDate: new Date("2025-08-20"),
			price: 3000,
			status: "Upcoming",
			description: "Experience the charm of Europe",
			imageUrl: "https://example.com/images/european-getaway.jpg",
		},
	});

	// Add destinations to voyage2
	await prisma.voyageDestination.create({
		data: {
			voyageId: voyage2.id,
			destinationId: paris.id,
			orderIndex: 1,
		},
	});

	const voyage3 = await prisma.voyage.create({
		data: {
			name: "World Tour",
			startDate: new Date("2025-09-01"),
			endDate: new Date("2025-09-30"),
			price: 5000,
			status: "Upcoming",
			description: "Visit the most iconic cities around the world",
			imageUrl: "https://example.com/images/world-tour.jpg",
		},
	});

	// Add destinations to voyage3
	await prisma.voyageDestination.create({
		data: {
			voyageId: voyage3.id,
			destinationId: newYork.id,
			orderIndex: 1,
		},
	});

	await prisma.voyageDestination.create({
		data: {
			voyageId: voyage3.id,
			destinationId: paris.id,
			orderIndex: 2,
		},
	});

	await prisma.voyageDestination.create({
		data: {
			voyageId: voyage3.id,
			destinationId: tokyo.id,
			orderIndex: 3,
		},
	});

	await prisma.voyageDestination.create({
		data: {
			voyageId: voyage3.id,
			destinationId: sydney.id,
			orderIndex: 4,
		},
	});

	return [voyage1, voyage2, voyage3];
}

async function seedBookings(voyages: any[], users: any[]) {
	const [voyage1, voyage2, voyage3] = voyages;
	const [adminUser, travelAgentUser, supportStaffUser, customer1, customer2] =
		users;

	// Create bookings
	await prisma.booking.create({
		data: {
			voyageId: voyage1.id,
			userId: customer1.id,
			status: "Confirmed",
			paymentStatus: "Paid",
			totalAmount: 2500,
		},
	});

	await prisma.booking.create({
		data: {
			voyageId: voyage2.id,
			userId: customer1.id,
			status: "Confirmed",
			paymentStatus: "Paid",
			totalAmount: 3000,
		},
	});

	await prisma.booking.create({
		data: {
			voyageId: voyage3.id,
			userId: customer2.id,
			status: "Pending",
			paymentStatus: "Pending",
			totalAmount: 5000,
		},
	});
}

async function seedSupportTickets(users: any[]) {
	const [adminUser, travelAgentUser, supportStaffUser, customer1, customer2] =
		users;

	// Create support tickets
	const ticket1 = await prisma.supportTicket.create({
		data: {
			userId: customer1.id,
			subject: "Question about my booking",
			description:
				"I need to change the date of my booking. Is this possible?",
			status: "Open",
			priority: "Medium",
			assignedToId: supportStaffUser.id,
		},
	});

	// Add response to ticket1
	await prisma.ticketResponse.create({
		data: {
			ticketId: ticket1.id,
			userId: supportStaffUser.id,
			response:
				"Yes, it is possible to change the date of your booking. Please provide your preferred new dates and we will check availability.",
		},
	});

	const ticket2 = await prisma.supportTicket.create({
		data: {
			userId: customer2.id,
			subject: "Payment issue",
			description:
				"I tried to make a payment but it failed. Can you help?",
			status: "In Progress",
			priority: "High",
			assignedToId: supportStaffUser.id,
		},
	});

	// Add response to ticket2
	await prisma.ticketResponse.create({
		data: {
			ticketId: ticket2.id,
			userId: supportStaffUser.id,
			response:
				"I'm sorry to hear about the payment issue. Can you please provide more details about the error you encountered?",
		},
	});

	await prisma.ticketResponse.create({
		data: {
			ticketId: ticket2.id,
			userId: customer2.id,
			response:
				"I got an error message saying \"Payment declined by bank\". I've checked with my bank and they say there's no issue on their end.",
		},
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
