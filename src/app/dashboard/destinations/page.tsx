
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
import { PlusCircle, Edit, Trash2, MoreHorizontal, Search, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { Destination } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useDestinationContext } from "@/contexts/DestinationContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const ITEMS_PER_PAGE = 5;

const DestinationForm = ({ destination, onSave }: { destination?: Destination | null, onSave: (destination: Destination) => void }) => {
  const [name, setName] = React.useState(destination?.name || "");
  const [country, setCountry] = React.useState(destination?.country || "");
  const [description, setDescription] = React.useState(destination?.description || "");
  const [imageUrl, setImageUrl] = React.useState(destination?.imageUrl || "");

  React.useEffect(() => {
    if (destination) {
      setName(destination.name);
      setCountry(destination.country);
      setDescription(destination.description || "");
      setImageUrl(destination.imageUrl || "");
    } else {
      setName("");
      setCountry("");
      setDescription("");
      setImageUrl("");
    }
  }, [destination]);

  const handleSubmit = () => {
    const newDestination: Destination = {
      id: destination?.id || Date.now().toString(),
      name,
      country,
      description,
      imageUrl: imageUrl || `https://placehold.co/100x100.png?text=${name.charAt(0).toUpperCase() || 'D'}`,
    };
    onSave(newDestination);
  };

  return (
    <>
      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="grid gap-6 py-4">
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="destName" className="sm:text-right text-left">Name</Label>
            <Input id="destName" value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-3" placeholder="e.g., Paris, Maldives" />
          </div>
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="country" className="sm:text-right text-left">Country</Label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="sm:col-span-3" placeholder="e.g., France, Japan" />
          </div>
          <div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
            <Label htmlFor="description" className="sm:text-right text-left sm:pt-2">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="sm:col-span-3 min-h-[80px]" placeholder="Brief description of the destination" />
          </div>
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="imageUrl" className="sm:text-right text-left">Image URL</Label>
            <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="sm:col-span-3" placeholder="https://example.com/image.png" />
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" onClick={handleSubmit}>Save Destination</Button>
      </DialogFooter>
    </>
  );
};

export default function DestinationManagementPage() {
  const { destinations, addDestination, updateDestination, deleteDestination, initialDestinationsLoaded } = useDestinationContext();
  const [editingDestination, setEditingDestination] = React.useState<Destination | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();

  const handleSaveDestination = (destination: Destination) => {
    if (editingDestination) {
      updateDestination(destination);
      toast({ title: "Destination Updated", description: `Destination '${destination.name}' has been successfully updated.` });
    } else {
      addDestination(destination);
      toast({ title: "Destination Added", description: `Destination '${destination.name}' has been successfully added.` });
    }
    setEditingDestination(null);
    setIsFormOpen(false);
  };

  const handleEditDestination = (destination: Destination) => {
    setEditingDestination(destination);
    setIsFormOpen(true);
  };

  const handleDeleteDestination = (destinationId: string) => {
    deleteDestination(destinationId);
    toast({ title: "Destination Deleted", description: `Destination has been successfully deleted.`, variant: "destructive" });
  };

  const filteredDestinations = React.useMemo(() => {
    if (!initialDestinationsLoaded) return [];
    return destinations.filter(dest =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dest.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [destinations, searchTerm, initialDestinationsLoaded]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, destinations.length]);
  
  const totalDestinations = filteredDestinations.length;
  const totalPages = totalDestinations > 0 ? Math.ceil(totalDestinations / ITEMS_PER_PAGE) : 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDestinations = filteredDestinations.slice(startIndex, endIndex);

  if (!initialDestinationsLoaded) {
    return <p>Loading destinations...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2"><MapPin className="h-7 w-7" /> Destination Management</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingDestination(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingDestination(null); setIsFormOpen(true); }} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Destination
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDestination ? "Edit Destination" : "Add New Destination"}</DialogTitle>
              <DialogDescription>
                {editingDestination ? "Modify details of the existing destination." : "Define a new travel destination."}
              </DialogDescription>
            </DialogHeader>
            <DestinationForm destination={editingDestination} onSave={handleSaveDestination} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search destinations..."
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
                <TableHead className="w-[80px] p-2 sm:p-4 hidden sm:table-cell">Image</TableHead>
                <TableHead className="p-2 sm:p-4">Name</TableHead>
                <TableHead className="p-2 sm:p-4">Country</TableHead>
                <TableHead className="p-2 sm:p-4 hidden md:table-cell">Description</TableHead>
                <TableHead className="text-right w-[80px] p-2 sm:p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDestinations.map((destination) => (
                <TableRow key={destination.id} className="hover:bg-muted/50">
                  <TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">
                    <Avatar className="h-10 w-10 rounded-md" data-ai-hint="landscape travel">
                      <AvatarImage src={destination.imageUrl || `https://placehold.co/40x40.png?text=${destination.name.charAt(0)}`} alt={destination.name} />
                      <AvatarFallback className="rounded-md">{destination.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium p-2 sm:p-4">{destination.name}</TableCell>
                  <TableCell className="p-2 sm:p-4">{destination.country}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate p-2 sm:p-4 hidden md:table-cell">{destination.description}</TableCell>
                  <TableCell className="text-right p-2 sm:p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditDestination(destination)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteDestination(destination.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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
      {totalDestinations === 0 && initialDestinationsLoaded && (
        <p className="text-center text-muted-foreground py-8">No destinations found.</p>
      )}
      {totalDestinations > 0 && initialDestinationsLoaded && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
          <span className="text-sm text-muted-foreground">
            Page {totalDestinations > 0 ? currentPage : 0} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalDestinations === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalDestinations === 0}
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
