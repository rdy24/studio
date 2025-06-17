
"use client";

import * as React from "react";
import type { Voyage } from "@/types";

interface VoyageContextType {
  voyages: Voyage[];
  addVoyage: (voyage: Voyage) => void;
  updateVoyage: (voyage: Voyage) => void;
  deleteVoyage: (voyageId: string) => void;
  initialVoyagesLoaded: boolean;
}

const VoyageContext = React.createContext<VoyageContextType | undefined>(undefined);

const initialVoyagesData: Voyage[] = [
  { id: "1", name: "Parisian Dream", destinationIds: ["1"], startDate: new Date("2024-09-01"), endDate: new Date("2024-09-07"), price: 1200, status: "Upcoming", description: "Explore the romantic city of Paris.", imageUrl: "https://placehold.co/600x400.png" },
  { id: "2", name: "Italian Getaway", destinationIds: ["2"], startDate: new Date("2024-08-15"), endDate: new Date("2024-08-22"), price: 1500, status: "Upcoming", description: "Discover the ancient wonders of Rome.", imageUrl: "https://placehold.co/600x400.png" },
];

const LOCAL_STORAGE_KEY = "voyageControlVoyages";

export const VoyageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voyages, setVoyages] = React.useState<Voyage[]>([]);
  const [initialVoyagesLoaded, setInitialVoyagesLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedVoyages = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedVoyages) {
        const parsedVoyages: Voyage[] = JSON.parse(storedVoyages).map((voyage: any) => ({
          ...voyage,
          startDate: voyage.startDate ? new Date(voyage.startDate) : undefined,
          endDate: voyage.endDate ? new Date(voyage.endDate) : undefined,
          price: Number(voyage.price) || 0,
        }));
        setVoyages(parsedVoyages);
      } else {
        setVoyages(initialVoyagesData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialVoyagesData));
      }
    } catch (error) {
      console.error("Failed to load voyages from localStorage:", error);
      setVoyages(initialVoyagesData);
    }
    setInitialVoyagesLoaded(true);
  }, []);

  React.useEffect(() => {
    if (initialVoyagesLoaded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(voyages));
      } catch (error) {
        console.error("Failed to save voyages to localStorage:", error);
      }
    }
  }, [voyages, initialVoyagesLoaded]);

  const addVoyage = (voyage: Voyage) => {
    setVoyages((prevVoyages) => [...prevVoyages, voyage]);
  };

  const updateVoyage = (updatedVoyage: Voyage) => {
    setVoyages((prevVoyages) =>
      prevVoyages.map((voy) => (voy.id === updatedVoyage.id ? updatedVoyage : voy))
    );
  };

  const deleteVoyage = (voyageId: string) => {
    setVoyages((prevVoyages) => prevVoyages.filter((voy) => voy.id !== voyageId));
  };

  return (
    <VoyageContext.Provider value={{ voyages, addVoyage, updateVoyage, deleteVoyage, initialVoyagesLoaded }}>
      {children}
    </VoyageContext.Provider>
  );
};

export const useVoyageContext = () => {
  const context = React.useContext(VoyageContext);
  if (context === undefined) {
    throw new Error("useVoyageContext must be used within a VoyageProvider");
  }
  return context;
};
