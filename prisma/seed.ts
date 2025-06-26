import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Starting database seeding...");

	// Create Permissions
	console.log("Creating permissions...");
	const permissions = await Promise.all([
		prisma.permission.upsert({
			where: { name: "manage_users" },
			update: {},
			create: {
				name: "manage_users",
				description: "Create, read, update, and delete users",
			},
		}),
		prisma.permission.upsert({
			where: { name: "manage_roles" },
			update: {},
			create: {
				name: "manage_roles",
				description: "Create, read, update, and delete roles",
			},
		}),
		prisma.permission.upsert({
			where: { name: "manage_voyages" },
			update: {},
			create: {
				name: "manage_voyages",
				description: "Create, read, update, and delete voyages",
			},
		}),
		prisma.permission.upsert({
			where: { name: "manage_destinations" },
			update: {},
			create: {
				name: "manage_destinations",
				description: "Create, read, update, and delete destinations",
			},
		}),
		prisma.permission.upsert({
			where: { name: "manage_bookings" },
			update: {},
			create: {
				name: "manage_bookings",
				description: "Create, read, update, and delete bookings",
			},
		}),
		prisma.permission.upsert({
			where: { name: "manage_schedules" },
			update: {},
			create: {
				name: "manage_schedules",
				description:
					"Create, read, update, and delete travel schedules",
			},
		}),
		prisma.permission.upsert({
			where: { name: "view_reports" },
			update: {},
			create: {
				name: "view_reports",
				description: "View system reports and analytics",
			},
		}),
		prisma.permission.upsert({
			where: { name: "view_bookings" },
			update: {},
			create: {
				name: "view_bookings",
				description: "View booking information",
			},
		}),
		prisma.permission.upsert({
			where: { name: "manage_support_tickets" },
			update: {},
			create: {
				name: "manage_support_tickets",
				description: "Create, read, update, and delete support tickets",
			},
		}),
	]);

	// Create Roles
	console.log("Creating roles...");
	const adminRole = await prisma.role.upsert({
		where: { name: "Administrator" },
		update: {},
		create: {
			name: "Administrator",
			description: "Full system access with all permissions",
		},
	});

	const travelAgentRole = await prisma.role.upsert({
		where: { name: "Travel Agent" },
		update: {},
		create: {
			name: "Travel Agent",
			description: "Manage voyages, destinations, and bookings",
		},
	});

	const customerRole = await prisma.role.upsert({
		where: { name: "Customer" },
		update: {},
		create: {
			name: "Customer",
			description: "View and book voyages",
		},
	});

	// Assign permissions to roles
	console.log("Assigning permissions to roles...");

	// Admin gets all permissions
	for (const permission of permissions) {
		await prisma.rolePermission.upsert({
			where: {
				roleId_permissionId: {
					roleId: adminRole.id,
					permissionId: permission.id,
				},
			},
			update: {},
			create: {
				roleId: adminRole.id,
				permissionId: permission.id,
			},
		});
	}

	// Travel Agent gets specific permissions
	const travelAgentPermissions = permissions.filter((p) =>
		[
			"manage_voyages",
			"manage_destinations",
			"manage_bookings",
			"manage_schedules",
			"view_reports",
		].includes(p.name)
	);
	for (const permission of travelAgentPermissions) {
		await prisma.rolePermission.upsert({
			where: {
				roleId_permissionId: {
					roleId: travelAgentRole.id,
					permissionId: permission.id,
				},
			},
			update: {},
			create: {
				roleId: travelAgentRole.id,
				permissionId: permission.id,
			},
		});
	}

	// Customer gets view permissions
	const customerPermissions = permissions.filter((p) =>
		["view_bookings"].includes(p.name)
	);
	for (const permission of customerPermissions) {
		await prisma.rolePermission.upsert({
			where: {
				roleId_permissionId: {
					roleId: customerRole.id,
					permissionId: permission.id,
				},
			},
			update: {},
			create: {
				roleId: customerRole.id,
				permissionId: permission.id,
			},
		});
	}

	// Create Users
	console.log("Creating users...");
	const adminUser = await prisma.user.upsert({
		where: { email: "admin@voyagecontrol.com" },
		update: {},
		create: {
			name: "System Administrator",
			email: "admin@voyagecontrol.com",
			roleId: adminRole.id,
			status: "Active",
		},
	});

	const travelAgentUser = await prisma.user.upsert({
		where: { email: "agent@voyagecontrol.com" },
		update: {},
		create: {
			name: "Travel Agent",
			email: "agent@voyagecontrol.com",
			roleId: travelAgentRole.id,
			status: "Active",
		},
	});

	const customerUser = await prisma.user.upsert({
		where: { email: "customer@example.com" },
		update: {},
		create: {
			name: "John Doe",
			email: "customer@example.com",
			roleId: customerRole.id,
			status: "Active",
		},
	});

	// Create Destinations
	console.log("Creating destinations...");
	const destinations = await Promise.all([
		prisma.destination.upsert({
			where: { id: "dest-paris" },
			update: {},
			create: {
				id: "dest-paris",
				name: "Paris",
				country: "France",
				description:
					"The City of Light, famous for its art, fashion, gastronomy, and culture.",
				imageUrl:
					"https://images.unsplash.com/photo-1502602898536-47ad22581b52",
			},
		}),
		prisma.destination.upsert({
			where: { id: "dest-tokyo" },
			update: {},
			create: {
				id: "dest-tokyo",
				name: "Tokyo",
				country: "Japan",
				description:
					"A bustling metropolis blending traditional culture with cutting-edge technology.",
				imageUrl:
					"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
			},
		}),
		prisma.destination.upsert({
			where: { id: "dest-bali" },
			update: {},
			create: {
				id: "dest-bali",
				name: "Bali",
				country: "Indonesia",
				description:
					"Tropical paradise known for its beaches, temples, and vibrant culture.",
				imageUrl:
					"https://images.unsplash.com/photo-1537953773345-d172ccf13cf1",
			},
		}),
		prisma.destination.upsert({
			where: { id: "dest-rome" },
			update: {},
			create: {
				id: "dest-rome",
				name: "Rome",
				country: "Italy",
				description:
					"The Eternal City, home to ancient history, art, and incredible cuisine.",
				imageUrl:
					"https://images.unsplash.com/photo-1552832230-c0197dd311b5",
			},
		}),
		prisma.destination.upsert({
			where: { id: "dest-santorini" },
			update: {},
			create: {
				id: "dest-santorini",
				name: "Santorini",
				country: "Greece",
				description:
					"Stunning Greek island known for its white-washed buildings and sunset views.",
				imageUrl:
					"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
			},
		}),
	]);

	// Create Voyages
	console.log("Creating voyages...");
	const voyage1 = await prisma.voyage.upsert({
		where: { id: "voyage-europe-classic" },
		update: {},
		create: {
			id: "voyage-europe-classic",
			name: "Classic European Adventure",
			description:
				"Explore the most beautiful cities in Europe with this comprehensive tour.",
			startDate: new Date("2025-07-15"),
			endDate: new Date("2025-07-25"),
			price: 2999.99,
			status: "Upcoming",
			imageUrl:
				"https://images.unsplash.com/photo-1467269204594-9661b134dd2b",
		},
	});

	const voyage2 = await prisma.voyage.upsert({
		where: { id: "voyage-asia-discovery" },
		update: {},
		create: {
			id: "voyage-asia-discovery",
			name: "Asian Discovery Tour",
			description:
				"Discover the wonders of Asia from bustling Tokyo to tropical Bali.",
			startDate: new Date("2025-08-10"),
			endDate: new Date("2025-08-20"),
			price: 3499.99,
			status: "Upcoming",
			imageUrl:
				"https://images.unsplash.com/photo-1528181304800-259b08848526",
		},
	});

	const voyage3 = await prisma.voyage.upsert({
		where: { id: "voyage-mediterranean" },
		update: {},
		create: {
			id: "voyage-mediterranean",
			name: "Mediterranean Escape",
			description:
				"Relax and unwind in the beautiful Mediterranean destinations.",
			startDate: new Date("2025-09-05"),
			endDate: new Date("2025-09-12"),
			price: 2199.99,
			status: "Upcoming",
			imageUrl:
				"https://images.unsplash.com/photo-1544737151-6e4b9d1b4d8a",
		},
	});

	// Link Voyages to Destinations
	console.log("Linking voyages to destinations...");
	await Promise.all([
		// European Adventure: Paris -> Rome
		prisma.voyageDestination.upsert({
			where: {
				voyageId_destinationId: {
					voyageId: voyage1.id,
					destinationId: destinations[0].id, // Paris
				},
			},
			update: {},
			create: {
				voyageId: voyage1.id,
				destinationId: destinations[0].id,
				sequenceOrder: 1,
			},
		}),
		prisma.voyageDestination.upsert({
			where: {
				voyageId_destinationId: {
					voyageId: voyage1.id,
					destinationId: destinations[3].id, // Rome
				},
			},
			update: {},
			create: {
				voyageId: voyage1.id,
				destinationId: destinations[3].id,
				sequenceOrder: 2,
			},
		}),
		// Asian Discovery: Tokyo -> Bali
		prisma.voyageDestination.upsert({
			where: {
				voyageId_destinationId: {
					voyageId: voyage2.id,
					destinationId: destinations[1].id, // Tokyo
				},
			},
			update: {},
			create: {
				voyageId: voyage2.id,
				destinationId: destinations[1].id,
				sequenceOrder: 1,
			},
		}),
		prisma.voyageDestination.upsert({
			where: {
				voyageId_destinationId: {
					voyageId: voyage2.id,
					destinationId: destinations[2].id, // Bali
				},
			},
			update: {},
			create: {
				voyageId: voyage2.id,
				destinationId: destinations[2].id,
				sequenceOrder: 2,
			},
		}),
		// Mediterranean: Rome -> Santorini
		prisma.voyageDestination.upsert({
			where: {
				voyageId_destinationId: {
					voyageId: voyage3.id,
					destinationId: destinations[3].id, // Rome
				},
			},
			update: {},
			create: {
				voyageId: voyage3.id,
				destinationId: destinations[3].id,
				sequenceOrder: 1,
			},
		}),
		prisma.voyageDestination.upsert({
			where: {
				voyageId_destinationId: {
					voyageId: voyage3.id,
					destinationId: destinations[4].id, // Santorini
				},
			},
			update: {},
			create: {
				voyageId: voyage3.id,
				destinationId: destinations[4].id,
				sequenceOrder: 2,
			},
		}),
	]);

	// Create Sample Bookings
	console.log("Creating sample bookings...");
	await Promise.all([
		prisma.booking.upsert({
			where: { id: "booking-1" },
			update: {},
			create: {
				id: "booking-1",
				voyageId: voyage1.id,
				userId: customerUser.id,
				status: "Confirmed",
				totalAmount: 2999.99,
				paymentStatus: "Paid",
				notes: "Customer requested window seat",
			},
		}),
		prisma.booking.upsert({
			where: { id: "booking-2" },
			update: {},
			create: {
				id: "booking-2",
				voyageId: voyage2.id,
				userId: customerUser.id,
				status: "Pending",
				totalAmount: 3499.99,
				paymentStatus: "Pending",
				notes: "Waiting for payment confirmation",
			},
		}),
	]);

	// Create Travel Schedules
	console.log("Creating travel schedules...");
	const schedule1 = await prisma.travelSchedule.upsert({
		where: { id: "schedule-1" },
		update: {},
		create: {
			id: "schedule-1",
			title: "Paris City Tour",
			voyageId: voyage1.id,
			startDatetime: new Date("2025-07-16T09:00:00Z"),
			endDatetime: new Date("2025-07-16T17:00:00Z"),
			location: "Paris, France",
			description:
				"Guided tour of Paris including Eiffel Tower, Louvre, and Notre-Dame",
			status: "Scheduled",
			notes: "Meet at hotel lobby at 8:45 AM",
		},
	});

	const schedule2 = await prisma.travelSchedule.upsert({
		where: { id: "schedule-2" },
		update: {},
		create: {
			id: "schedule-2",
			title: "Tokyo Cultural Experience",
			voyageId: voyage2.id,
			startDatetime: new Date("2025-08-11T10:00:00Z"),
			endDatetime: new Date("2025-08-11T16:00:00Z"),
			location: "Tokyo, Japan",
			description: "Traditional tea ceremony and temple visits",
			status: "Scheduled",
			notes: "Dress code: modest clothing required for temples",
		},
	});

	// Add participants to schedules
	console.log("Adding schedule participants...");
	await Promise.all([
		prisma.travelScheduleParticipant.upsert({
			where: {
				scheduleId_userId: {
					scheduleId: schedule1.id,
					userId: customerUser.id,
				},
			},
			update: {},
			create: {
				scheduleId: schedule1.id,
				userId: customerUser.id,
			},
		}),
		prisma.travelScheduleParticipant.upsert({
			where: {
				scheduleId_userId: {
					scheduleId: schedule2.id,
					userId: customerUser.id,
				},
			},
			update: {},
			create: {
				scheduleId: schedule2.id,
				userId: customerUser.id,
			},
		}),
	]);

	// Create System Settings
	console.log("Creating system settings...");
	await Promise.all([
		prisma.systemSetting.upsert({
			where: { key: "app_name" },
			update: {},
			create: {
				key: "app_name",
				value: "Voyage Control",
				description: "Application name",
				isPublic: true,
			},
		}),
		prisma.systemSetting.upsert({
			where: { key: "app_version" },
			update: {},
			create: {
				key: "app_version",
				value: "1.0.0",
				description: "Application version",
				isPublic: true,
			},
		}),
		prisma.systemSetting.upsert({
			where: { key: "default_currency" },
			update: {},
			create: {
				key: "default_currency",
				value: "USD",
				description: "Default currency for pricing",
				isPublic: true,
			},
		}),
		prisma.systemSetting.upsert({
			where: { key: "max_booking_days" },
			update: {},
			create: {
				key: "max_booking_days",
				value: "365",
				description: "Maximum days in advance for booking",
				isPublic: false,
			},
		}),
	]);

	// Create Activity Logs
	console.log("Creating activity logs...");
	await Promise.all([
		prisma.activityLog.create({
			data: {
				userId: adminUser.id,
				action: "system_setup",
				entityType: "system",
				entityId: "initial_setup",
				details: JSON.stringify({
					message: "Database seeded with initial data",
				}),
				ipAddress: "127.0.0.1",
				userAgent: "Prisma Seeder",
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: customerUser.id,
				action: "booking_created",
				entityType: "booking",
				entityId: "booking-1",
				details: JSON.stringify({
					voyage: "Classic European Adventure",
					amount: 2999.99,
				}),
				ipAddress: "192.168.1.100",
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			},
		}),
	]);

	console.log("✅ Database seeding completed successfully!");
	console.log("\n📊 Seeded data summary:");
	console.log(`- ${permissions.length} permissions`);
	console.log("- 3 roles (Administrator, Travel Agent, Customer)");
	console.log("- 3 users");
	console.log(`- ${destinations.length} destinations`);
	console.log("- 3 voyages");
	console.log("- 2 bookings");
	console.log("- 2 travel schedules");
	console.log("- 4 system settings");
	console.log("- 2 activity logs");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error("❌ Error during seeding:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
