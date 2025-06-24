"use client";

import * as React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
	PlusCircle,
	Edit,
	Trash2,
	MoreHorizontal,
	Search,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import type { Role } from "@/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useRoleContext } from "@/contexts/RoleContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const ITEMS_PER_PAGE = 5;

const allPermissions = [
	{ id: "1", label: "User Read", name: "user:read" },
	{ id: "2", label: "User Create", name: "user:create" },
	{ id: "3", label: "User Update", name: "user:update" },
	{ id: "4", label: "User Delete", name: "user:delete" },
	{ id: "5", label: "Role Read", name: "role:read" },
	{ id: "6", label: "Role Create", name: "role:create" },
	{ id: "7", label: "Role Update", name: "role:update" },
	{ id: "8", label: "Role Delete", name: "role:delete" },
	{ id: "9", label: "Destination Read", name: "destination:read" },
	{ id: "10", label: "Destination Create", name: "destination:create" },
	{ id: "11", label: "Destination Update", name: "destination:update" },
	{ id: "12", label: "Destination Delete", name: "destination:delete" },
	{ id: "13", label: "Voyage Read", name: "voyage:read" },
	{ id: "14", label: "Voyage Create", name: "voyage:create" },
	{ id: "15", label: "Voyage Update", name: "voyage:update" },
	{ id: "16", label: "Voyage Delete", name: "voyage:delete" },
	{ id: "17", label: "Booking Read", name: "booking:read" },
	{ id: "18", label: "Booking Create", name: "booking:create" },
	{ id: "19", label: "Booking Update", name: "booking:update" },
	{ id: "20", label: "Booking Delete", name: "booking:delete" },
	{ id: "21", label: "Ticket Read", name: "ticket:read" },
	{ id: "22", label: "Ticket Create", name: "ticket:create" },
	{ id: "23", label: "Ticket Update", name: "ticket:update" },
	{ id: "24", label: "Ticket Delete", name: "ticket:delete" },
	{ id: "25", label: "Ticket Assign", name: "ticket:assign" },
	{ id: "26", label: "Ticket Respond", name: "ticket:respond" },
];

const RoleForm = ({
	role,
	onSave,
	isSubmitting,
}: {
	role?: Role | null;
	onSave: (role: Role) => void;
	isSubmitting: boolean;
}) => {
	const [name, setName] = React.useState(role?.name || "");
	const [description, setDescription] = React.useState(
		role?.description || ""
	);
	const [selectedPermissions, setSelectedPermissions] = React.useState<
		string[]
	>(role?.permissions || []);

	React.useEffect(() => {
		if (role) {
			setName(role.name);
			setDescription(role.description);
			setSelectedPermissions(role.permissions);
		} else {
			setName("");
			setDescription("");
			setSelectedPermissions([]);
		}
	}, [role]);

	const handlePermissionChange = (permissionId: string) => {
		setSelectedPermissions((prev) =>
			prev.includes(permissionId)
				? prev.filter((p) => p !== permissionId)
				: [...prev, permissionId]
		);
	};

	const handleSubmit = () => {
		const newRole: Role = {
			id: role?.id || Date.now().toString(),
			name,
			description,
			permissions: selectedPermissions,
		};
		onSave(newRole);
	};

	return (
		<>
			<ScrollArea className="max-h-[60vh] pr-4">
				<div className="grid gap-6 py-4">
					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="roleName"
							className="sm:text-right text-left"
						>
							Role Name
						</Label>
						<Input
							id="roleName"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="sm:col-span-3"
						/>
					</div>
					<div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
						<Label
							htmlFor="description"
							className="sm:text-right text-left sm:pt-2"
						>
							Description
						</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="sm:col-span-3 min-h-[80px]"
						/>
					</div>
					<div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
						<Label className="sm:text-right text-left sm:pt-2">
							Permissions
						</Label>
						<div className="sm:col-span-3 space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
							{allPermissions.map((permission) => (
								<div
									key={permission.id}
									className="flex items-center space-x-2"
								>
									<Checkbox
										id={`perm-${permission.id}`}
										checked={selectedPermissions.includes(
											permission.id
										)}
										onCheckedChange={() =>
											handlePermissionChange(
												permission.id
											)
										}
									/>
									<Label
										htmlFor={`perm-${permission.id}`}
										className="font-normal cursor-pointer"
									>
										{permission.label}
									</Label>
								</div>
							))}
						</div>
					</div>
				</div>
			</ScrollArea>
			<DialogFooter className="pt-4">
				<DialogClose asChild>
					<Button
						type="button"
						variant="outline"
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				</DialogClose>
				<Button
					type="submit"
					onClick={handleSubmit}
					disabled={isSubmitting}
				>
					{isSubmitting ? "Saving..." : "Save role"}
				</Button>
			</DialogFooter>
		</>
	);
};

export default function RoleManagementPage() {
	const {
		roles,
		addRole,
		updateRole,
		deleteRole,
		initialRolesLoaded,
		isLoading,
	} = useRoleContext();
	const [editingRole, setEditingRole] = React.useState<Role | null>(null);
	const [isFormOpen, setIsFormOpen] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState("");
	const [currentPage, setCurrentPage] = React.useState(1);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const { toast } = useToast();

	const handleSaveRole = async (role: Role) => {
		setIsSubmitting(true);
		try {
			if (editingRole) {
				// Map permissions to permissionIds for the API
				const permissionIds = role.permissions;
				const result = await updateRole(editingRole.id, {
					name: role.name,
					description: role.description,
					permissionIds,
				});

				if (result) {
					toast({
						title: "Role Updated",
						description: `Role '${result.name}' has been successfully updated.`,
					});
					setEditingRole(null);
					setIsFormOpen(false);
				}
			} else {
				// Map permissions to permissionIds for the API
				const permissionIds = role.permissions;
				const result = await addRole({
					name: role.name,
					description: role.description,
					permissions: [], // Required by type but will be overridden by API
					permissionIds,
				});

				if (result) {
					toast({
						title: "Role Added",
						description: `Role '${result.name}' has been successfully added.`,
					});
					setIsFormOpen(false);
				}
			}
		} catch (error) {
			console.error("Error saving role:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to save role",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditRole = (role: Role) => {
		setEditingRole(role);
		setIsFormOpen(true);
	};

	const handleDeleteRole = async (roleId: string) => {
		try {
			const success = await deleteRole(roleId);
			if (success) {
				toast({
					title: "Role Deleted",
					description: `Role has been successfully deleted.`,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error deleting role:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to delete role",
				variant: "destructive",
			});
		}
	};

	const filteredRoles = React.useMemo(() => {
		if (!initialRolesLoaded) return [];
		return roles.filter(
			(role) =>
				role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				role.description
					.toLowerCase()
					.includes(searchTerm.toLowerCase())
		);
	}, [roles, searchTerm, initialRolesLoaded]);

	React.useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, roles.length]);

	const totalRoles = filteredRoles.length;
	const totalPages =
		totalRoles > 0 ? Math.ceil(totalRoles / ITEMS_PER_PAGE) : 1;
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

	if (!initialRolesLoaded) {
		return <p>Loading roles...</p>;
	}

	return (
		<div className="space-y-6 w-full p-4 md:p-6 lg:p-8">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h1 className="text-3xl font-bold text-primary tracking-tight">
					Role Management
				</h1>
				<Dialog
					open={isFormOpen}
					onOpenChange={(isOpen) => {
						setIsFormOpen(isOpen);
						if (!isOpen) setEditingRole(null);
					}}
				>
					<DialogTrigger asChild>
						<Button
							onClick={() => {
								setEditingRole(null);
								setIsFormOpen(true);
							}}
							className="w-full sm:w-auto"
						>
							<PlusCircle className="mr-2 h-4 w-4" /> Add Role
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>
								{editingRole ? "Edit Role" : "Add New Role"}
							</DialogTitle>
							<DialogDescription>
								{editingRole
									? "Modify the details of the existing role."
									: "Define a new role and its permissions."}
							</DialogDescription>
						</DialogHeader>
						<RoleForm
							role={editingRole}
							onSave={handleSaveRole}
							isSubmitting={isSubmitting}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div className="relative w-full sm:w-auto">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search roles..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 w-full md:w-[300px]"
					/>
				</div>
				{isLoading && (
					<div className="flex items-center text-sm text-muted-foreground">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
						Loading...
					</div>
				)}
			</div>

			<Card className="shadow-lg w-full">
				<CardContent className="p-0">
					<Table className="w-full">
						<TableHeader>
							<TableRow>
								<TableHead className="p-2 sm:p-4">
									Role Name
								</TableHead>
								<TableHead className="p-2 sm:p-4 hidden sm:table-cell">
									Description
								</TableHead>
								<TableHead className="p-2 sm:p-4">
									Permissions
								</TableHead>
								<TableHead className="text-right w-[80px] p-2 sm:p-4">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedRoles.map((role, index) => (
								<TableRow
									key={`role-${role.id}-${index}`}
									className="hover:bg-muted/50"
								>
									<TableCell className="font-medium p-2 sm:p-4">
										{role.name}
									</TableCell>
									<TableCell className="text-sm text-muted-foreground max-w-xs truncate p-2 sm:p-4 hidden sm:table-cell">
										{role.description}
									</TableCell>
									<TableCell className="p-2 sm:p-4">
										<div className="flex flex-wrap gap-1">
											{role.permissions
												.slice(0, 3)
												.map((permission, idx) => (
													<Badge
														key={`perm-${permission}-${idx}`}
														variant="secondary"
														className="text-xs"
													>
														{allPermissions.find(
															(p) =>
																p.id ===
																permission
														)?.label || permission}
													</Badge>
												))}
											{role.permissions.length > 3 && (
												<Badge variant="secondary">
													+
													{role.permissions.length -
														3}{" "}
													more
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell className="text-right p-2 sm:p-4">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0"
												>
													<span className="sr-only">
														Open menu
													</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() =>
														handleEditRole(role)
													}
												>
													<Edit className="mr-2 h-4 w-4" />{" "}
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														handleDeleteRole(
															role.id
														)
													}
													className="text-destructive focus:text-destructive focus:bg-destructive/10"
												>
													<Trash2 className="mr-2 h-4 w-4" />{" "}
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			{totalRoles === 0 && initialRolesLoaded && (
				<p className="text-center text-muted-foreground py-8">
					No roles found.
				</p>
			)}
			{totalRoles > 0 && initialRolesLoaded && (
				<div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
					<span className="text-sm text-muted-foreground">
						Page {totalRoles > 0 ? currentPage : 0} of {totalPages}
					</span>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage((prev) => Math.max(prev - 1, 1))
							}
							disabled={currentPage === 1 || totalRoles === 0}
						>
							<ChevronLeft className="mr-1 h-4 w-4" />
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage((prev) =>
									Math.min(prev + 1, totalPages)
								)
							}
							disabled={
								currentPage === totalPages || totalRoles === 0
							}
						>
							Next
							<ChevronRight className="ml-1 h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
