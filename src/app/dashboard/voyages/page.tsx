
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, MoreHorizontal, Search, ChevronLeft, ChevronRight, PlaneTakeoff, CalendarIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 5;

const VoyageForm = ({ voyage, onSave }: { voyage?: Voyage | null, onSave: (voyage: Voyage) => void }) => {
  const { destinations: availableDestinations, initialDestinationsLoaded } = useDestinationContext();
  const [name, setName] = React.useState(voyage?.name || "");
  const [selectedDestinationIds, setSelectedDestinationIds] = React.useState<string[]>(voyage?.destinationIds || []);
  const [startDate, setStartDate] = React.useState<Date | undefined>(voyage?.startDate);
  const [endDate, setEndDate] = React.useState<Date | undefined>(voyage?.endDate);
  const [price, setPrice] = React.useState<number>(voyage?.price || 0);
  const [status, setStatus] = React.useState<Voyage["status"]>(voyage?.status || "Upcoming");
  const [description, setDescription] = React.useState(voyage?.description || "");
  const [imageUrl, setImageUrl] = React.useState(voyage?.imageUrl || "");
  const { toast } = useToast();

  React.useEffect(() => {
    if (voyage) {
      setName(voyage.name);
      setSelectedDestinationIds(voyage.destinationIds);
      setStartDate(voyage.startDate ? new Date(voyage.startDate) : undefined);
      setEndDate(voyage.endDate ? new Date(voyage.endDate) : undefined);
      setPrice(voyage.price);
      setStatus(voyage.status);
      setDescription(voyage.description || "");
      setImageUrl(voyage.imageUrl || "");
    } else {
      setName("");
      setSelectedDestinationIds([]);
      setStartDate(undefined);
      setEndDate(undefined);
      setPrice(0);
      setStatus("Upcoming");
      setDescription("");
      setImageUrl("");
    }
  }, [voyage]);

  const handleDestinationToggle = (destinationId: string) => {
    setSelectedDestinationIds((prev) =>
      prev.includes(destinationId)
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId]
    );
  };

  const handleSubmit = () => {
    if (!name || selectedDestinationIds.length === 0 || !startDate || !endDate || price <= 0) {
        toast({title: "Missing Information", description: "Please fill in all required fields for the voyage.", variant: "destructive"});
        return;
    }
    const newVoyage: Voyage = {
      id: voyage?.id || Date.now().toString(),
      name,
      destinationIds: selectedDestinationIds,
      startDate,
      endDate,
      price,
      status,
      description,
      imageUrl: imageUrl || `https://placehold.co/100x100.png?text=${name.charAt(0).toUpperCase() || 'V'}`,
    };
    onSave(newVoyage);
  };
  

  return (
    <>
      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="grid gap-6 py-4">
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="voyageName" className="sm:text-right text-left">Name*</Label>
            <Input id="voyageName" value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-3" placeholder="e.g., Alpine Adventure" />
          </div>

          <div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
            <Label className="sm:text-right text-left sm:pt-2">Destinations*</Label>
            <div className="sm:col-span-3">
              {initialDestinationsLoaded ? (
                availableDestinations.length > 0 ? (
                  <ScrollArea className="h-32 w-full rounded-md border p-2">
                    {availableDestinations.map((dest) => (
                      <div key={dest.id} className="flex items-center space-x-2 mb-1">
                        <Checkbox
                          id={`dest-${dest.id}`}
                          checked={selectedDestinationIds.includes(dest.id)}
                          onCheckedChange={() => handleDestinationToggle(dest.id)}
                        />
                        <Label htmlFor={`dest-${dest.id}`} className="font-normal cursor-pointer">{dest.name} ({dest.country})</Label>
                      </div>
                    ))}
                  </ScrollArea>
                ) : <p className="text-sm text-muted-foreground">No destinations available. Please add destinations first.</p>
              ) : <p className="text-sm text-muted-foreground">Loading destinations...</p>}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="startDate" className="sm:text-right text-left">Start Date*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "sm:col-span-3 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
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
          </div>

          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="endDate" className="sm:text-right text-left">End Date*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "sm:col-span-3 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => startDate && date < startDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="price" className="sm:text-right text-left">Price (USD)*</Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="sm:col-span-3" placeholder="e.g., 1500" min="0" />
          </div>

          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="status" className="sm:text-right text-left">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Voyage["status"])}>
              <SelectTrigger className="sm:col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
            <Label htmlFor="voyageDescription" className="sm:text-right text-left sm:pt-2">Description</Label>
            <Textarea id="voyageDescription" value={description} onChange={(e) => setDescription(e.target.value)} className="sm:col-span-3 min-h-[80px]" placeholder="Detailed information about the voyage" />
          </div>
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="voyageImageUrl" className="sm:text-right text-left">Image URL</Label>
            <Input id="voyageImageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="sm:col-span-3" placeholder="https://example.com/voyage-image.png" />
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" onClick={handleSubmit}>Save Voyage</Button>
      </DialogFooter>
    </>
  );
};


const VoyageTableRow = ({ voyage, onEdit, onDelete }: { voyage: Voyage; onEdit: (voyage: Voyage) => void; onDelete: (voyageId: string) => void; }) => {
  const { getDestinationNameById } = useDestinationContext();
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);

  const formattedStartDate = isMounted && voyage.startDate ? format(new Date(voyage.startDate), "PP") : (voyage.startDate ? "Loading..." : "N/A");
  const formattedEndDate = isMounted && voyage.endDate ? format(new Date(voyage.endDate), "PP") : (voyage.endDate ? "Loading..." : "N/A");
  
  const destinationNames = voyage.destinationIds.map(id => getDestinationNameById(id)).join(", ");

  const getStatusBadgeVariant = (status: Voyage["status"]): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "Upcoming": return "default"; 
      case "Ongoing": return "secondary"; 
      case "Completed": return "outline"; 
      case "Cancelled": return "destructive"; 
      default: return "default";
    }
  };


  if (!isMounted && (voyage.startDate || voyage.endDate)) {
     return (
      <TableRow className="hover:bg-muted/50">
        <TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">
            <Avatar className="h-10 w-10 rounded-md" data-ai-hint="travel journey">
                <AvatarFallback className="rounded-md">{voyage.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
        </TableCell>
        <TableCell className="font-medium p-1 sm:p-2 md:p-4">{voyage.name}</TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4 hidden xs:table-cell max-w-[150px] truncate" title={destinationNames}>{destinationNames}</TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4 hidden md:table-cell">Loading...</TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4 hidden md:table-cell">Loading...</TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">${voyage.price.toLocaleString()}</TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4"><Badge variant={getStatusBadgeVariant(voyage.status)}>{voyage.status}</Badge></TableCell>
        <TableCell className="text-right p-1 sm:p-2 md:p-4 w-[80px]">
          <div className="h-8 w-8" /> 
        </TableCell>
      </TableRow>
     );
  }


  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">
        <Avatar className="h-10 w-10 rounded-md" data-ai-hint="travel journey">
          <AvatarImage src={voyage.imageUrl || `https://placehold.co/40x40.png?text=${voyage.name.charAt(0)}`} alt={voyage.name} />
          <AvatarFallback className="rounded-md">{voyage.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="font-medium p-1 sm:p-2 md:p-4">{voyage.name}</TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4 hidden xs:table-cell max-w-[150px] truncate" title={destinationNames}>{destinationNames || 'N/A'}</TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4 hidden md:table-cell">{formattedStartDate}</TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4 hidden md:table-cell">{formattedEndDate}</TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">${voyage.price.toLocaleString()}</TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4"><Badge variant={getStatusBadgeVariant(voyage.status)}>{voyage.status}</Badge></TableCell>
      <TableCell className="text-right p-1 sm:p-2 md:p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(voyage)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(voyage.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};


export default function VoyageManagementPage() {
  const { voyages, addVoyage, updateVoyage, deleteVoyage, initialVoyagesLoaded } = useVoyageContext();
  const [editingVoyage, setEditingVoyage] = React.useState<Voyage | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();

  const handleSaveVoyage = (voyage: Voyage) => {
    if (editingVoyage) {
      updateVoyage(voyage);
      toast({ title: "Voyage Updated", description: `Voyage '${voyage.name}' has been successfully updated.` });
    } else {
      addVoyage(voyage);
      toast({ title: "Voyage Added", description: `Voyage '${voyage.name}' has been successfully added.` });
    }
    setEditingVoyage(null);
    setIsFormOpen(false);
  };

  const handleEditVoyage = (voyage: Voyage) => {
    setEditingVoyage(voyage);
    setIsFormOpen(true);
  };

  const handleDeleteVoyage = (voyageId: string) => {
    deleteVoyage(voyageId);
    toast({ title: "Voyage Deleted", description: `Voyage has been successfully deleted.`, variant: "destructive" });
  };
  
  const { getDestinationNameById, initialDestinationsLoaded } = useDestinationContext();

  const filteredVoyages = React.useMemo(() => {
    if (!initialVoyagesLoaded || !initialDestinationsLoaded) return [];
    return voyages.filter(voy => {
        const destinationNames = voy.destinationIds.map(id => getDestinationNameById(id)).join(", ").toLowerCase();
        return (
            voy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (voy.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            destinationNames.includes(searchTerm.toLowerCase()) ||
            voy.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
  }, [voyages, searchTerm, initialVoyagesLoaded, getDestinationNameById, initialDestinationsLoaded]);
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, voyages.length]);

  const totalVoyages = filteredVoyages.length;
  const totalPages = totalVoyages > 0 ? Math.ceil(totalVoyages / ITEMS_PER_PAGE) : 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVoyages = filteredVoyages.slice(startIndex, endIndex);

  if (!initialVoyagesLoaded || !initialDestinationsLoaded) {
    return <p>Loading voyages and destinations...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2"><PlaneTakeoff className="h-7 w-7" /> Voyage Management</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingVoyage(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingVoyage(null); setIsFormOpen(true); }} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Voyage
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVoyage ? "Edit Voyage" : "Add New Voyage"}</DialogTitle>
              <DialogDescription>
                {editingVoyage ? "Modify details of the existing voyage." : "Define a new travel voyage."}
              </DialogDescription>
            </DialogHeader>
            <VoyageForm voyage={editingVoyage} onSave={handleSaveVoyage} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search voyages (name, destination, status...)"
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
                <TableHead className="p-2 sm:p-4 hidden xs:table-cell">Destinations</TableHead>
                <TableHead className="p-2 sm:p-4 hidden md:table-cell">Start Date</TableHead>
                <TableHead className="p-2 sm:p-4 hidden md:table-cell">End Date</TableHead>
                <TableHead className="p-2 sm:p-4 hidden sm:table-cell">Price</TableHead>
                <TableHead className="p-2 sm:p-4">Status</TableHead>
                <TableHead className="text-right w-[80px] p-2 sm:p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVoyages.map((voyage) => (
                 <VoyageTableRow 
                    key={voyage.id} 
                    voyage={voyage} 
                    onEdit={handleEditVoyage} 
                    onDelete={handleDeleteVoyage}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {totalVoyages === 0 && initialVoyagesLoaded &&(
        <p className="text-center text-muted-foreground py-8">No voyages found.</p>
      )}
      {totalVoyages > 0 && initialVoyagesLoaded && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
          <span className="text-sm text-muted-foreground">
            Page {totalVoyages > 0 ? currentPage : 0} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalVoyages === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalVoyages === 0}
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
