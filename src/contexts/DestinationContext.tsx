
"use client";

import * as React from "react";
import type { Destination } from "@/types";

interface DestinationContextType {
  destinations: Destination[];
  addDestination: (destination: Destination) => void;
  updateDestination: (destination: Destination) => void;
  deleteDestination: (destinationId: string) => void;
  initialDestinationsLoaded: boolean;
  getDestinationNameById: (id: string) => string;
}

const DestinationContext = React.createContext<DestinationContextType | undefined>(undefined);

const initialDestinationsData: Destination[] = [
  { id: "1", name: "Paris", country: "France", description: "The city of lights and love.", imageUrl: "https://placehold.co/600x400.png" },
  { id: "2", name: "Rome", country: "Italy", description: "Ancient ruins and delicious pasta.", imageUrl: "https://placehold.co/600x400.png" },
  { id: "3", name: "Tokyo", country: "Japan", description: "A vibrant blend of tradition and modernity.", imageUrl: "https://placehold.co/600x400.png" },
];

const LOCAL_STORAGE_KEY = "voyageControlDestinations";

export const DestinationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [destinations, setDestinations] = React.useState<Destination[]>([]);
  const [initialDestinationsLoaded, setInitialDestinationsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedDestinations = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedDestinations) {
        setDestinations(JSON.parse(storedDestinations));
      } else {
        setDestinations(initialDestinationsData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialDestinationsData));
      }
    } catch (error) {
      console.error("Failed to load destinations from localStorage:", error);
      setDestinations(initialDestinationsData);
    }
    setInitialDestinationsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (initialDestinationsLoaded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(destinations));
      } catch (error) {
        console.error("Failed to save destinations to localStorage:", error);
      }
    }
  }, [destinations, initialDestinationsLoaded]);

  const addDestination = (destination: Destination) => {
    setDestinations((prevDestinations) => [...prevDestinations, destination]);
  };

  const updateDestination = (updatedDestination: Destination) => {
    setDestinations((prevDestinations) =>
      prevDestinations.map((dest) => (dest.id === updatedDestination.id ? updatedDestination : dest))
    );
  };

  const deleteDestination = (destinationId: string) => {
    setDestinations((prevDestinations) => prevDestinations.filter((dest) => dest.id !== destinationId));
  };

  const getDestinationNameById = (id: string): string => {
    const destination = destinations.find(d => d.id === id);
    return destination ? destination.name : "Unknown";
  };

  return (
    <DestinationContext.Provider value={{ destinations, addDestination, updateDestination, deleteDestination, initialDestinationsLoaded, getDestinationNameById }}>
      {children}
    </DestinationContext.Provider>
  );
};

export const useDestinationContext = () => {
  const context = React.useContext(DestinationContext);
  if (context === undefined) {
    throw new Error("useDestinationContext must be used within a DestinationProvider");
  }
  return context;
};
