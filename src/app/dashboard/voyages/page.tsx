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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
	PlusCircle,
	Edit,
	Trash2,
	MoreHorizontal,
	Search,
	ChevronLeft,
	ChevronRight,
	Ship,
	Calendar,
	DollarSign,
	MapPin,
} from "lucide-react";
import type { Voyage, Destination } from "@/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useVoyageContext } from "@/contexts/VoyageContext";
import { useDestinationContext } from "@/contexts/DestinationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	VoyageCreateInput,
	VoyageUpdateInput,
} from "@/lib/services/voyage-frontend-service";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 5;

const formatDate = (date: Date | string | undefined) => {
	if (!date) return "Not set";
	return new Date(date).toLocaleDateString();
};

const formatPrice = (price: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(price);
};

const getStatusColor = (status: string) => {
	switch (status) {
		case "Upcoming":
			return "bg-blue-100 text-blue-800";
		case "Ongoing":
			return "bg-green-100 text-green-800";
		case "Completed":
			return "bg-gray-100 text-gray-800";
		case "Cancelled":
			return "bg-red-100 text-red-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

const VoyageForm = ({
	voyage,
	onSave,
	isSubmitting,
}: {
	voyage?: Voyage | null;
	onSave: (voyageData: VoyageCreateInput | VoyageUpdateInput) => void;
	isSubmitting: boolean;
}) => {
	const { destinations } = useDestinationContext();

	const [name, setName] = React.useState(voyage?.name || "");
	const [startDate, setStartDate] = React.useState(
		voyage?.startDate
			? new Date(voyage.startDate).toISOString().split("T")[0]
			: ""
	);
	const [endDate, setEndDate] = React.useState(
		voyage?.endDate
			? new Date(voyage.endDate).toISOString().split("T")[0]
			: ""
	);
	const [price, setPrice] = React.useState(voyage?.price?.toString() || "");
	const [status, setStatus] = React.useState<
		"Upcoming" | "Ongoing" | "Completed" | "Cancelled"
	>(
		(voyage?.status as
			| "Upcoming"
			| "Ongoing"
			| "Completed"
			| "Cancelled") || "Upcoming"
	);
	const [description, setDescription] = React.useState(
		voyage?.description || ""
	);
	const [imageUrl, setImageUrl] = React.useState(voyage?.imageUrl || "");
	const [selectedDestinations, setSelectedDestinations] = React.useState<
		string[]
	>(voyage?.destinationIds || []);

	React.useEffect(() => {
		if (voyage) {
			setName(voyage.name);
			setStartDate(
				voyage.startDate
					? new Date(voyage.startDate).toISOString().split("T")[0]
					: ""
			);
			setEndDate(
				voyage.endDate
					? new Date(voyage.endDate).toISOString().split("T")[0]
					: ""
			);
			setPrice(voyage.price.toString());
			setStatus(voyage.status);
			setDescription(voyage.description || "");
			setImageUrl(voyage.imageUrl || "");
			setSelectedDestinations(voyage.destinationIds || []);
		} else {
			setName("");
			setStartDate("");
			setEndDate("");
			setPrice("");
			setStatus("Upcoming");
			setDescription("");
			setImageUrl("");
			setSelectedDestinations([]);
		}
	}, [voyage]);

	const handleSubmit = () => {
		const voyageData: VoyageCreateInput | VoyageUpdateInput = {
			name,
			start_date: startDate || null,
			end_date: endDate || null,
			price: parseFloat(price),
			status,
			description: description || null,
			image_url: imageUrl || null,
			destination_ids: selectedDestinations.map((id) => parseInt(id)),
		};
		onSave(voyageData);
	};

	const handleDestinationToggle = (destinationId: string) => {
		setSelectedDestinations((prev) =>
			prev.includes(destinationId)
				? prev.filter((id) => id !== destinationId)
				: [...prev, destinationId]
		);
	};

	return (
		<>
			<ScrollArea className="max-h-[60vh] pr-4">
				<div className="grid gap-6 py-4">
					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="voyageName"
							className="sm:text-right text-left"
						>
							Name
						</Label>
						<Input
							id="voyageName"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="sm:col-span-3"
							placeholder="e.g., European Adventure"
						/>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="startDate"
							className="sm:text-right text-left"
						>
							Start Date
						</Label>
						<Input
							id="startDate"
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="sm:col-span-3"
						/>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="endDate"
							className="sm:text-right text-left"
						>
							End Date
						</Label>
						<Input
							id="endDate"
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="sm:col-span-3"
						/>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="price"
							className="sm:text-right text-left"
						>
							Price
						</Label>
						<Input
							id="price"
							type="number"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							className="sm:col-span-3"
							placeholder="e.g., 1299.99"
						/>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="status"
							className="sm:text-right text-left"
						>
							Status
						</Label>
						<Select
							value={status}
							onValueChange={(value) =>
								setStatus(
									value as
										| "Upcoming"
										| "Ongoing"
										| "Completed"
										| "Cancelled"
								)
							}
						>
							<SelectTrigger className="sm:col-span-3">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Upcoming">
									Upcoming
								</SelectItem>
								<SelectItem value="Ongoing">Ongoing</SelectItem>
								<SelectItem value="Completed">
									Completed
								</SelectItem>
								<SelectItem value="Cancelled">
									Cancelled
								</SelectItem>
							</SelectContent>
						</Select>
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
							placeholder="Brief description of the voyage"
						/>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="imageUrl"
							className="sm:text-right text-left"
						>
							Image URL
						</Label>
						<Input
							id="imageUrl"
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
							className="sm:col-span-3"
							placeholder="https://example.com/image.png"
						/>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
						<Label className="sm:text-right text-left sm:pt-2">
							Destinations
						</Label>
						<div className="sm:col-span-3">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								{destinations.map((destination) => (
									<div
										key={destination.id}
										className="flex items-center space-x-2"
									>
										<input
											type="checkbox"
											id={`dest-${destination.id}`}
											checked={selectedDestinations.includes(
												destination.id
											)}
											onChange={() =>
												handleDestinationToggle(
													destination.id
												)
											}
											className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
										/>
										<label
											htmlFor={`dest-${destination.id}`}
											className="text-sm"
										>
											{destination.name},{" "}
											{destination.country}
										</label>
									</div>
								))}
							</div>
							{destinations.length === 0 && (
								<p className="text-sm text-muted-foreground">
									No destinations available. Please add
									destinations first.
								</p>
							)}
							{selectedDestinations.length === 0 && (
								<p className="text-sm text-red-500 mt-2">
									Please select at least one destination.
								</p>
							)}
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
					disabled={
						isSubmitting ||
						selectedDestinations.length === 0 ||
						!name ||
						!price
					}
				>
					{isSubmitting ? "Saving..." : "Save Voyage"}
				</Button>
			</DialogFooter>
		</>
	);
};

export default function VoyageManagementPage() {
	const {
		voyages,
		addVoyage,
		updateVoyage,
		deleteVoyage,
		initialVoyagesLoaded,
		isLoading,
		getVoyageById,
	} = useVoyageContext();

	const { destinations, getDestinationNameById } = useDestinationContext();

	const [editingVoyage, setEditingVoyage] = React.useState<Voyage | null>(
		null
	);
	const [isFormOpen, setIsFormOpen] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState("");
	const [currentPage, setCurrentPage] = React.useState(1);
	const [statusFilter, setStatusFilter] = React.useState<string>("");
	const { toast } = useToast();

	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleSaveVoyage = async (
		voyageData: VoyageCreateInput | VoyageUpdateInput
	) => {
		setIsSubmitting(true);
		try {
			if (editingVoyage) {
				const result = await updateVoyage(editingVoyage.id, voyageData);

				if (result) {
					toast({
						title: "Voyage Updated",
						description: `Voyage '${result.name}' has been successfully updated.`,
					});
					setEditingVoyage(null);
					setIsFormOpen(false);
				}
			} else {
				const result = await addVoyage(voyageData as VoyageCreateInput);

				if (result) {
					toast({
						title: "Voyage Added",
						description: `Voyage '${result.name}' has been successfully added.`,
					});
					setIsFormOpen(false);
				}
			}
		} catch (error) {
			console.error("Error saving voyage:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to save voyage",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditVoyage = (voyage: Voyage) => {
		setEditingVoyage(voyage);
		setIsFormOpen(true);
	};

	const [deletingVoyageId, setDeletingVoyageId] = React.useState<
		string | null
	>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

	const handleDeleteVoyage = (voyageId: string) => {
		setDeletingVoyageId(voyageId);
		setIsDeleteDialogOpen(true);
	};

	const confirmDeleteVoyage = async () => {
		if (!deletingVoyageId) return;

		try {
			const success = await deleteVoyage(deletingVoyageId);
			if (success) {
				toast({
					title: "Voyage Deleted",
					description: `Voyage has been successfully deleted.`,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error deleting voyage:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to delete voyage",
				variant: "destructive",
			});
		} finally {
			setDeletingVoyageId(null);
			setIsDeleteDialogOpen(false);
		}
	};

	const filteredVoyages = React.useMemo(() => {
		if (!initialVoyagesLoaded) return [];

		return voyages.filter((voyage) => {
			// Apply search filter
			const matchesSearch =
				voyage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(voyage.description || "")
					.toLowerCase()
					.includes(searchTerm.toLowerCase());

			// Apply status filter
			const matchesStatus =
				statusFilter && statusFilter !== "all"
					? voyage.status === statusFilter
					: true;

			return matchesSearch && matchesStatus;
		});
	}, [voyages, searchTerm, statusFilter, initialVoyagesLoaded]);

	React.useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, statusFilter, voyages.length]);

	const totalVoyages = filteredVoyages.length;
	const totalPages =
		totalVoyages > 0 ? Math.ceil(totalVoyages / ITEMS_PER_PAGE) : 1;
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const paginatedVoyages = filteredVoyages.slice(startIndex, endIndex);

	if (!initialVoyagesLoaded) {
		return <p>Loading voyages...</p>;
	}

	return (
		<div className="space-y-6 w-full p-4 md:p-6 lg:p-8">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
					<Ship className="h-7 w-7" /> Voyage Management
				</h1>
				<Dialog
					open={isFormOpen}
					onOpenChange={(isOpen) => {
						setIsFormOpen(isOpen);
						if (!isOpen) setEditingVoyage(null);
					}}
				>
					<DialogTrigger asChild>
						<Button
							onClick={() => {
								setEditingVoyage(null);
								setIsFormOpen(true);
							}}
							className="w-full sm:w-auto"
						>
							<PlusCircle className="mr-2 h-4 w-4" /> Add Voyage
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>
								{editingVoyage
									? "Edit Voyage"
									: "Add New Voyage"}
							</DialogTitle>
							<DialogDescription>
								{editingVoyage
									? "Modify details of the existing voyage."
									: "Define a new travel voyage."}
							</DialogDescription>
						</DialogHeader>
						<VoyageForm
							voyage={editingVoyage}
							onSave={handleSaveVoyage}
							isSubmitting={isSubmitting}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div className="relative w-full sm:w-auto">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search voyages..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 w-full md:w-[300px]"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Select
						value={statusFilter}
						onValueChange={setStatusFilter}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="Upcoming">Upcoming</SelectItem>
							<SelectItem value="Ongoing">Ongoing</SelectItem>
							<SelectItem value="Completed">Completed</SelectItem>
							<SelectItem value="Cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
					{isLoading && (
						<div className="flex items-center text-sm text-muted-foreground">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
							Loading...
						</div>
					)}
				</div>
			</div>

			<Card className="shadow-lg w-full">
				<CardContent className="p-0">
					<Table className="w-full">
						<TableHeader>
							<TableRow>
								<TableHead className="w-[80px] p-2 sm:p-4 hidden sm:table-cell">
									Image
								</TableHead>
								<TableHead className="p-2 sm:p-4">
									Name
								</TableHead>
								<TableHead className="p-2 sm:p-4 hidden md:table-cell">
									Destinations
								</TableHead>
								<TableHead className="p-2 sm:p-4 hidden md:table-cell">
									Dates
								</TableHead>
								<TableHead className="p-2 sm:p-4">
									Price
								</TableHead>
								<TableHead className="p-2 sm:p-4">
									Status
								</TableHead>
								<TableHead className="text-right w-[80px] p-2 sm:p-4">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedVoyages.map((voyage) => (
								<TableRow
									key={voyage.id}
									className="hover:bg-muted/50"
								>
									<TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">
										<Avatar
											className="h-10 w-10 rounded-md"
											data-ai-hint="landscape travel"
										>
											<AvatarImage
												src={
													voyage.imageUrl ||
													`https://placehold.co/40x40.png?text=${voyage.name.charAt(
														0
													)}`
												}
												alt={voyage.name}
											/>
											<AvatarFallback className="rounded-md">
												{voyage.name
													.charAt(0)
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</TableCell>
									<TableCell className="font-medium p-2 sm:p-4">
										{voyage.name}
									</TableCell>
									<TableCell className="p-2 sm:p-4 hidden md:table-cell">
										<div className="flex flex-wrap gap-1">
											{voyage.destinations ? (
												voyage.destinations.map(
													(dest) => (
														<Badge
															key={dest.id}
															variant="outline"
															className="flex items-center gap-1"
														>
															<MapPin className="h-3 w-3" />
															{dest.name}
														</Badge>
													)
												)
											) : voyage.destinationIds ? (
												voyage.destinationIds.map(
													(destId) => (
														<Badge
															key={destId}
															variant="outline"
															className="flex items-center gap-1"
														>
															<MapPin className="h-3 w-3" />
															{getDestinationNameById(
																destId
															)}
														</Badge>
													)
												)
											) : (
												<span className="text-xs text-muted-foreground">
													No destinations
												</span>
											)}
										</div>
									</TableCell>
									<TableCell className="p-2 sm:p-4 hidden md:table-cell">
										<div className="flex flex-col text-xs">
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />{" "}
												Start:{" "}
												{formatDate(voyage.startDate)}
											</span>
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />{" "}
												End:{" "}
												{formatDate(voyage.endDate)}
											</span>
										</div>
									</TableCell>
									<TableCell className="p-2 sm:p-4">
										<span className="flex items-center gap-1">
											<DollarSign className="h-3 w-3" />
											{formatPrice(voyage.price)}
										</span>
									</TableCell>
									<TableCell className="p-2 sm:p-4">
										<Badge
											className={getStatusColor(
												voyage.status
											)}
										>
											{voyage.status}
										</Badge>
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
														handleEditVoyage(voyage)
													}
												>
													<Edit className="mr-2 h-4 w-4" />{" "}
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														handleDeleteVoyage(
															voyage.id
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
			{totalVoyages === 0 && initialVoyagesLoaded && (
				<p className="text-center text-muted-foreground py-8">
					No voyages found.
				</p>
			)}
			{totalVoyages > 0 && initialVoyagesLoaded && (
				<div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
					<span className="text-sm text-muted-foreground">
						Page {totalVoyages > 0 ? currentPage : 0} of{" "}
						{totalPages}
					</span>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage((prev) => Math.max(prev - 1, 1))
							}
							disabled={currentPage === 1 || totalVoyages === 0}
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
								currentPage === totalPages || totalVoyages === 0
							}
						>
							Next
							<ChevronRight className="ml-1 h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this voyage? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<DialogClose asChild>
							<Button
								variant="outline"
								onClick={() => setDeletingVoyageId(null)}
							>
								Cancel
							</Button>
						</DialogClose>
						<Button
							variant="destructive"
							onClick={confirmDeleteVoyage}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
