"use client";

import * as React from "react";
import { format } from "date-fns";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	PlusCircle,
	Edit,
	Trash2,
	MoreHorizontal,
	Search,
	ChevronLeft,
	ChevronRight,
	Calendar as CalendarIcon,
	Clock,
} from "lucide-react";
import type { TravelSchedule, Voyage, User } from "@/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTravelScheduleContext } from "@/contexts/TravelScheduleContext";
import { useVoyageContext } from "@/contexts/VoyageContext";
import { useUserContext } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 5;

const TravelScheduleForm = ({
	schedule,
	onSave,
}: {
	schedule?: TravelSchedule | null;
	onSave: (schedule: TravelSchedule) => void;
}) => {
	const { voyages: availableVoyages, initialVoyagesLoaded } =
		useVoyageContext();
	const { users: availableUsers, initialUsersLoaded } = useUserContext();
	const [title, setTitle] = React.useState(schedule?.title || "");
	const [voyageId, setVoyageId] = React.useState(schedule?.voyageId || "");
	const [startDate, setStartDate] = React.useState<Date | undefined>(
		schedule?.startDateTime
			? new Date(schedule.startDateTime.toDateString())
			: undefined
	);
	const [startTime, setStartTime] = React.useState(
		schedule?.startDateTime
			? format(schedule.startDateTime, "HH:mm")
			: "09:00"
	);
	const [endDate, setEndDate] = React.useState<Date | undefined>(
		schedule?.endDateTime
			? new Date(schedule.endDateTime.toDateString())
			: undefined
	);
	const [endTime, setEndTime] = React.useState(
		schedule?.endDateTime ? format(schedule.endDateTime, "HH:mm") : "17:00"
	);
	const [location, setLocation] = React.useState(schedule?.location || "");
	const [description, setDescription] = React.useState(
		schedule?.description || ""
	);
	const [status, setStatus] = React.useState<TravelSchedule["status"]>(
		schedule?.status || "Scheduled"
	);
	const [selectedParticipants, setSelectedParticipants] = React.useState<
		string[]
	>(schedule?.participants || []);
	const [notes, setNotes] = React.useState(schedule?.notes || "");
	const { toast } = useToast();

	React.useEffect(() => {
		if (schedule) {
			setTitle(schedule.title);
			setVoyageId(schedule.voyageId);
			setStartDate(
				schedule.startDateTime
					? new Date(schedule.startDateTime.toDateString())
					: undefined
			);
			setStartTime(
				schedule.startDateTime
					? format(schedule.startDateTime, "HH:mm")
					: "09:00"
			);
			setEndDate(
				schedule.endDateTime
					? new Date(schedule.endDateTime.toDateString())
					: undefined
			);
			setEndTime(
				schedule.endDateTime
					? format(schedule.endDateTime, "HH:mm")
					: "17:00"
			);
			setLocation(schedule.location);
			setDescription(schedule.description || "");
			setStatus(schedule.status);
			setSelectedParticipants(schedule.participants);
			setNotes(schedule.notes || "");
		} else {
			setTitle("");
			setVoyageId("");
			setStartDate(undefined);
			setStartTime("09:00");
			setEndDate(undefined);
			setEndTime("17:00");
			setLocation("");
			setDescription("");
			setStatus("Scheduled");
			setSelectedParticipants([]);
			setNotes("");
		}
	}, [schedule]);

	const handleParticipantToggle = (userId: string) => {
		setSelectedParticipants((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId]
		);
	};

	const handleSubmit = () => {
		if (!title || !voyageId || !startDate || !endDate || !location) {
			toast({
				title: "Missing Information",
				description:
					"Please fill in all required fields for the travel schedule.",
				variant: "destructive",
			});
			return;
		}

		// Combine date and time
		const startDateTime = new Date(startDate);
		const [startHour, startMinute] = startTime.split(":").map(Number);
		startDateTime.setHours(startHour, startMinute);

		const endDateTime = new Date(endDate);
		const [endHour, endMinute] = endTime.split(":").map(Number);
		endDateTime.setHours(endHour, endMinute);

		if (endDateTime <= startDateTime) {
			toast({
				title: "Invalid Time",
				description: "End date/time must be after start date/time.",
				variant: "destructive",
			});
			return;
		}

		const newSchedule: TravelSchedule = {
			id: schedule?.id || Date.now().toString(),
			title,
			voyageId,
			startDateTime,
			endDateTime,
			location,
			description,
			status,
			participants: selectedParticipants,
			notes,
		};
		onSave(newSchedule);
	};

	return (
		<>
			<ScrollArea className="max-h-[60vh] pr-4">
				<div className="grid gap-6 py-4">
					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="scheduleTitle"
							className="sm:text-right text-left"
						>
							Title*
						</Label>
						<Input
							id="scheduleTitle"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="sm:col-span-3"
							placeholder="e.g., City Tour Paris"
						/>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="voyageSelect"
							className="sm:text-right text-left"
						>
							Voyage*
						</Label>
						<Select value={voyageId} onValueChange={setVoyageId}>
							<SelectTrigger className="sm:col-span-3">
								<SelectValue placeholder="Select a voyage" />
							</SelectTrigger>
							<SelectContent>
								{initialVoyagesLoaded ? (
									availableVoyages.length > 0 ? (
										availableVoyages.map((voyage) => (
											<SelectItem
												key={voyage.id}
												value={voyage.id}
											>
												{voyage.name}
											</SelectItem>
										))
									) : (
										<SelectItem value="" disabled>
											No voyages available
										</SelectItem>
									)
								) : (
									<SelectItem value="" disabled>
										Loading voyages...
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label className="sm:text-right text-left">
							Start Date & Time*
						</Label>
						<div className="sm:col-span-3 flex gap-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"flex-1 justify-start text-left font-normal",
											!startDate &&
												"text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{startDate ? (
											format(startDate, "PPP")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={startDate}
										onSelect={setStartDate}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<Input
								type="time"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								className="w-32"
							/>
						</div>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label className="sm:text-right text-left">
							End Date & Time*
						</Label>
						<div className="sm:col-span-3 flex gap-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"flex-1 justify-start text-left font-normal",
											!endDate && "text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{endDate ? (
											format(endDate, "PPP")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={endDate}
										onSelect={setEndDate}
										disabled={(date) =>
											startDate ? date < startDate : false
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<Input
								type="time"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								className="w-32"
							/>
						</div>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
						<Label
							htmlFor="location"
							className="sm:text-right text-left"
						>
							Location*
						</Label>
						<Input
							id="location"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							className="sm:col-span-3"
							placeholder="e.g., Eiffel Tower, Paris"
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
								setStatus(value as TravelSchedule["status"])
							}
						>
							<SelectTrigger className="sm:col-span-3">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Scheduled">
									Scheduled
								</SelectItem>
								<SelectItem value="In Progress">
									In Progress
								</SelectItem>
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
						<Label className="sm:text-right text-left sm:pt-2">
							Participants
						</Label>
						<div className="sm:col-span-3">
							{initialUsersLoaded ? (
								availableUsers.length > 0 ? (
									<ScrollArea className="h-32 w-full rounded-md border p-2">
										{availableUsers.map((user) => (
											<div
												key={user.id}
												className="flex items-center space-x-2 mb-1"
											>
												<Checkbox
													id={`user-${user.id}`}
													checked={selectedParticipants.includes(
														user.id
													)}
													onCheckedChange={() =>
														handleParticipantToggle(
															user.id
														)
													}
												/>
												<Label
													htmlFor={`user-${user.id}`}
													className="font-normal cursor-pointer"
												>
													{user.name} ({user.email})
												</Label>
											</div>
										))}
									</ScrollArea>
								) : (
									<p className="text-sm text-muted-foreground">
										No users available.
									</p>
								)
							) : (
								<p className="text-sm text-muted-foreground">
									Loading users...
								</p>
							)}
						</div>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
						<Label
							htmlFor="scheduleDescription"
							className="sm:text-right text-left sm:pt-2"
						>
							Description
						</Label>
						<Textarea
							id="scheduleDescription"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="sm:col-span-3 min-h-[80px]"
							placeholder="Detailed information about the schedule"
						/>
					</div>

					<div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
						<Label
							htmlFor="scheduleNotes"
							className="sm:text-right text-left sm:pt-2"
						>
							Notes
						</Label>
						<Textarea
							id="scheduleNotes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							className="sm:col-span-3 min-h-[60px]"
							placeholder="Additional notes or instructions"
						/>
					</div>
				</div>
			</ScrollArea>
			<DialogFooter className="pt-4">
				<DialogClose asChild>
					<Button type="button" variant="outline">
						Cancel
					</Button>
				</DialogClose>
				<Button type="submit" onClick={handleSubmit}>
					Save Schedule
				</Button>
			</DialogFooter>
		</>
	);
};

const TravelScheduleTableRow = ({
	schedule,
	onEdit,
	onDelete,
}: {
	schedule: TravelSchedule;
	onEdit: (schedule: TravelSchedule) => void;
	onDelete: (scheduleId: string) => void;
}) => {
	const { getVoyageNameById } = useVoyageContext();
	const { getUserNameById } = useUserContext();
	const [isMounted, setIsMounted] = React.useState(false);
	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	const formattedStartDateTime =
		isMounted && schedule.startDateTime
			? format(new Date(schedule.startDateTime), "PPp")
			: schedule.startDateTime
			? "Loading..."
			: "N/A";
	const formattedEndDateTime =
		isMounted && schedule.endDateTime
			? format(new Date(schedule.endDateTime), "PPp")
			: schedule.endDateTime
			? "Loading..."
			: "N/A";

	const voyageName = getVoyageNameById(schedule.voyageId);
	const participantNames = schedule.participants
		.map((id) => getUserNameById(id))
		.filter(Boolean)
		.join(", ");

	const getStatusBadgeVariant = (
		status: TravelSchedule["status"]
	): "default" | "secondary" | "outline" | "destructive" => {
		switch (status) {
			case "Scheduled":
				return "default";
			case "In Progress":
				return "secondary";
			case "Completed":
				return "outline";
			case "Cancelled":
				return "destructive";
			default:
				return "default";
		}
	};

	if (!isMounted && (schedule.startDateTime || schedule.endDateTime)) {
		return (
			<TableRow className="hover:bg-muted/50">
				<TableCell className="font-medium p-1 sm:p-2 md:p-4">
					{schedule.title}
				</TableCell>
				<TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">
					{voyageName || "N/A"}
				</TableCell>
				<TableCell className="p-1 sm:p-2 md:p-4 hidden md:table-cell">
					Loading...
				</TableCell>
				<TableCell className="p-1 sm:p-2 md:p-4 hidden lg:table-cell">
					Loading...
				</TableCell>
				<TableCell
					className="p-1 sm:p-2 md:p-4 hidden xs:table-cell max-w-[150px] truncate"
					title={schedule.location}
				>
					{schedule.location}
				</TableCell>
				<TableCell className="p-1 sm:p-2 md:p-4">
					<Badge variant={getStatusBadgeVariant(schedule.status)}>
						{schedule.status}
					</Badge>
				</TableCell>
				<TableCell className="text-right p-1 sm:p-2 md:p-4 w-[80px]">
					<div className="h-8 w-8" />
				</TableCell>
			</TableRow>
		);
	}

	return (
		<TableRow className="hover:bg-muted/50">
			<TableCell className="font-medium p-1 sm:p-2 md:p-4">
				{schedule.title}
			</TableCell>
			<TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">
				{voyageName || "N/A"}
			</TableCell>
			<TableCell className="p-1 sm:p-2 md:p-4 hidden md:table-cell text-xs">
				{formattedStartDateTime}
			</TableCell>
			<TableCell className="p-1 sm:p-2 md:p-4 hidden lg:table-cell text-xs">
				{formattedEndDateTime}
			</TableCell>
			<TableCell
				className="p-1 sm:p-2 md:p-4 hidden xs:table-cell max-w-[150px] truncate"
				title={schedule.location}
			>
				{schedule.location}
			</TableCell>
			<TableCell className="p-1 sm:p-2 md:p-4">
				<Badge variant={getStatusBadgeVariant(schedule.status)}>
					{schedule.status}
				</Badge>
			</TableCell>
			<TableCell className="text-right p-1 sm:p-2 md:p-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onEdit(schedule)}>
							<Edit className="mr-2 h-4 w-4" /> Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onDelete(schedule.id)}
							className="text-destructive focus:text-destructive focus:bg-destructive/10"
						>
							<Trash2 className="mr-2 h-4 w-4" /> Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
};

export default function TravelScheduleManagementPage() {
	const {
		travelSchedules,
		addTravelSchedule,
		updateTravelSchedule,
		deleteTravelSchedule,
		initialTravelSchedulesLoaded,
	} = useTravelScheduleContext();
	const { getVoyageNameById, initialVoyagesLoaded } = useVoyageContext();
	const { getUserNameById, initialUsersLoaded } = useUserContext();
	const [editingSchedule, setEditingSchedule] =
		React.useState<TravelSchedule | null>(null);
	const [isFormOpen, setIsFormOpen] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState("");
	const [currentPage, setCurrentPage] = React.useState(1);
	const { toast } = useToast();

	const handleSaveSchedule = (schedule: TravelSchedule) => {
		if (editingSchedule) {
			updateTravelSchedule(schedule);
			toast({
				title: "Schedule Updated",
				description: `Schedule '${schedule.title}' has been successfully updated.`,
			});
		} else {
			addTravelSchedule(schedule);
			toast({
				title: "Schedule Added",
				description: `Schedule '${schedule.title}' has been successfully added.`,
			});
		}
		setEditingSchedule(null);
		setIsFormOpen(false);
	};

	const handleEditSchedule = (schedule: TravelSchedule) => {
		setEditingSchedule(schedule);
		setIsFormOpen(true);
	};

	const handleDeleteSchedule = (scheduleId: string) => {
		deleteTravelSchedule(scheduleId);
		toast({
			title: "Schedule Deleted",
			description: `Schedule has been successfully deleted.`,
			variant: "destructive",
		});
	};

	const filteredSchedules = React.useMemo(() => {
		if (
			!initialTravelSchedulesLoaded ||
			!initialVoyagesLoaded ||
			!initialUsersLoaded
		)
			return [];
		return travelSchedules.filter((schedule) => {
			const voyageName = getVoyageNameById(schedule.voyageId) || "";
			const participantNames = schedule.participants
				.map((id) => getUserNameById(id))
				.filter(Boolean)
				.join(" ");
			return (
				schedule.title
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				(schedule.description || "")
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				schedule.location
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				voyageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				participantNames
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				schedule.status.toLowerCase().includes(searchTerm.toLowerCase())
			);
		});
	}, [
		travelSchedules,
		searchTerm,
		initialTravelSchedulesLoaded,
		getVoyageNameById,
		getUserNameById,
		initialVoyagesLoaded,
		initialUsersLoaded,
	]);

	React.useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, travelSchedules.length]);

	const totalSchedules = filteredSchedules.length;
	const totalPages =
		totalSchedules > 0 ? Math.ceil(totalSchedules / ITEMS_PER_PAGE) : 1;
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);

	if (
		!initialTravelSchedulesLoaded ||
		!initialVoyagesLoaded ||
		!initialUsersLoaded
	) {
		return <p>Loading travel schedules...</p>;
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
					<Clock className="h-7 w-7" /> Travel Schedule Management
				</h1>
				<Dialog
					open={isFormOpen}
					onOpenChange={(isOpen) => {
						setIsFormOpen(isOpen);
						if (!isOpen) setEditingSchedule(null);
					}}
				>
					<DialogTrigger asChild>
						<Button
							onClick={() => {
								setEditingSchedule(null);
								setIsFormOpen(true);
							}}
							className="w-full sm:w-auto"
						>
							<PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								{editingSchedule
									? "Edit Travel Schedule"
									: "Add New Travel Schedule"}
							</DialogTitle>
							<DialogDescription>
								{editingSchedule
									? "Modify details of the existing travel schedule."
									: "Create a new travel schedule for a voyage."}
							</DialogDescription>
						</DialogHeader>
						<TravelScheduleForm
							schedule={editingSchedule}
							onSave={handleSaveSchedule}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search schedules (title, voyage, location, participants...)"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10 w-full md:w-1/2 lg:w-1/3"
				/>
			</div>

			<Card className="shadow-lg">
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="p-2 sm:p-4">
									Title
								</TableHead>
								<TableHead className="p-2 sm:p-4 hidden sm:table-cell">
									Voyage
								</TableHead>
								<TableHead className="p-2 sm:p-4 hidden md:table-cell">
									Start
								</TableHead>
								<TableHead className="p-2 sm:p-4 hidden lg:table-cell">
									End
								</TableHead>
								<TableHead className="p-2 sm:p-4 hidden xs:table-cell">
									Location
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
							{paginatedSchedules.map((schedule) => (
								<TravelScheduleTableRow
									key={schedule.id}
									schedule={schedule}
									onEdit={handleEditSchedule}
									onDelete={handleDeleteSchedule}
								/>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			{totalSchedules === 0 && initialTravelSchedulesLoaded && (
				<p className="text-center text-muted-foreground py-8">
					No travel schedules found.
				</p>
			)}
			{totalSchedules > 0 && initialTravelSchedulesLoaded && (
				<div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
					<span className="text-sm text-muted-foreground">
						Page {totalSchedules > 0 ? currentPage : 0} of{" "}
						{totalPages}
					</span>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage((prev) => Math.max(prev - 1, 1))
							}
							disabled={currentPage === 1 || totalSchedules === 0}
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
								currentPage === totalPages ||
								totalSchedules === 0
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
