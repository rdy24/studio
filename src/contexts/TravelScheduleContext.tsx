"use client";

import * as React from "react";
import type { TravelSchedule } from "@/types";

interface TravelScheduleContextType {
	travelSchedules: TravelSchedule[];
	addTravelSchedule: (schedule: TravelSchedule) => void;
	updateTravelSchedule: (schedule: TravelSchedule) => void;
	deleteTravelSchedule: (scheduleId: string) => void;
	initialTravelSchedulesLoaded: boolean;
}

const TravelScheduleContext = React.createContext<
	TravelScheduleContextType | undefined
>(undefined);

const initialTravelSchedulesData: TravelSchedule[] = [
	{
		id: "1",
		title: "City Tour Paris",
		voyageId: "1",
		startDateTime: new Date("2024-09-02T09:00:00"),
		endDateTime: new Date("2024-09-02T17:00:00"),
		location: "Eiffel Tower, Paris",
		description:
			"Guided tour of Paris landmarks including Eiffel Tower, Louvre, and Notre Dame",
		status: "Scheduled",
		participants: ["1", "2"],
		notes: "Bring comfortable walking shoes",
	},
	{
		id: "2",
		title: "Colosseum Visit",
		voyageId: "2",
		startDateTime: new Date("2024-08-16T10:00:00"),
		endDateTime: new Date("2024-08-16T14:00:00"),
		location: "Colosseum, Rome",
		description: "Historical tour of the ancient Roman Colosseum",
		status: "Scheduled",
		participants: ["1"],
		notes: "Skip-the-line tickets included",
	},
];

const LOCAL_STORAGE_KEY = "voyageControlTravelSchedules";

export const TravelScheduleProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [travelSchedules, setTravelSchedules] = React.useState<
		TravelSchedule[]
	>([]);
	const [initialTravelSchedulesLoaded, setInitialTravelSchedulesLoaded] =
		React.useState(false);

	React.useEffect(() => {
		try {
			const storedSchedules = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (storedSchedules) {
				const parsedSchedules: TravelSchedule[] = JSON.parse(
					storedSchedules
				).map((schedule: any) => ({
					...schedule,
					startDateTime: schedule.startDateTime
						? new Date(schedule.startDateTime)
						: new Date(),
					endDateTime: schedule.endDateTime
						? new Date(schedule.endDateTime)
						: new Date(),
				}));
				setTravelSchedules(parsedSchedules);
			} else {
				setTravelSchedules(initialTravelSchedulesData);
				localStorage.setItem(
					LOCAL_STORAGE_KEY,
					JSON.stringify(initialTravelSchedulesData)
				);
			}
		} catch (error) {
			console.error(
				"Failed to load travel schedules from localStorage:",
				error
			);
			setTravelSchedules(initialTravelSchedulesData);
		}
		setInitialTravelSchedulesLoaded(true);
	}, []);

	React.useEffect(() => {
		if (initialTravelSchedulesLoaded) {
			try {
				localStorage.setItem(
					LOCAL_STORAGE_KEY,
					JSON.stringify(travelSchedules)
				);
			} catch (error) {
				console.error(
					"Failed to save travel schedules to localStorage:",
					error
				);
			}
		}
	}, [travelSchedules, initialTravelSchedulesLoaded]);

	const addTravelSchedule = (schedule: TravelSchedule) => {
		setTravelSchedules((prevSchedules) => [...prevSchedules, schedule]);
	};

	const updateTravelSchedule = (updatedSchedule: TravelSchedule) => {
		setTravelSchedules((prevSchedules) =>
			prevSchedules.map((schedule) =>
				schedule.id === updatedSchedule.id ? updatedSchedule : schedule
			)
		);
	};

	const deleteTravelSchedule = (scheduleId: string) => {
		setTravelSchedules((prevSchedules) =>
			prevSchedules.filter((schedule) => schedule.id !== scheduleId)
		);
	};

	return (
		<TravelScheduleContext.Provider
			value={{
				travelSchedules,
				addTravelSchedule,
				updateTravelSchedule,
				deleteTravelSchedule,
				initialTravelSchedulesLoaded,
			}}
		>
			{children}
		</TravelScheduleContext.Provider>
	);
};

export const useTravelScheduleContext = () => {
	const context = React.useContext(TravelScheduleContext);
	if (context === undefined) {
		throw new Error(
			"useTravelScheduleContext must be used within a TravelScheduleProvider"
		);
	}
	return context;
};
