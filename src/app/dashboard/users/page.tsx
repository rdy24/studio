
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
import { PlusCircle, Edit, Trash2, MoreHorizontal, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/contexts/UserContext";
import { useRoleContext } from "@/contexts/RoleContext"; 
import { ScrollArea } from "@/components/ui/scroll-area";

const ITEMS_PER_PAGE = 5;

const UserForm = ({ user, onSave, availableRoles }: { user?: User | null, onSave: (user: User) => void, availableRoles: string[] }) => {
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [role, setRole] = React.useState(user?.role || (availableRoles.length > 0 ? availableRoles[0] : ""));
  const [status, setStatus] = React.useState(user?.status || "Pending");

  const handleSubmit = () => {
    const newUser: User = {
      id: user?.id || Date.now().toString(),
      name,
      email,
      role,
      status: status as User["status"],
      avatar: user?.avatar || `https://placehold.co/40x40.png?text=${name.charAt(0).toUpperCase() || 'U'}`,
      dateJoined: user?.dateJoined || new Date(),
      lastLogin: user?.status === "Active" ? (user?.lastLogin || new Date()) : undefined,
    };
    onSave(newUser);
  };
  
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setStatus(user.status);
    } else {
      setName("");
      setEmail("");
      setRole(availableRoles.length > 0 ? availableRoles[0] : "");
      setStatus("Pending");
    }
  }, [user, availableRoles]);


  return (
    <>
      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="grid gap-4 py-4">
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="name" className="sm:text-right text-left">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-3" />
          </div>
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="email" className="sm:text-right text-left">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="sm:col-span-3" />
          </div>
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="role" className="sm:text-right text-left">Role</Label>
            <Select value={role} onValueChange={setRole} disabled={availableRoles.length === 0}>
              <SelectTrigger className="sm:col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="status" className="sm:text-right text-left">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="sm:col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-4">
        <DialogClose asChild>
           <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" onClick={handleSubmit}>Save user</Button>
      </DialogFooter>
    </>
  );
};

interface UserTableRowProps {
  user: User;
  statusBadgeVariant: "default" | "secondary" | "outline" | "destructive";
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, statusBadgeVariant, onEdit, onDelete }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedDateJoined = isMounted && user.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : (user.dateJoined ? 'Loading...' : 'N/A');
  const formattedLastLogin = isMounted && user.lastLogin ? new Date(user.lastLogin).toLocaleString() : (user.lastLogin ? 'Loading...' : 'N/A');
  
  if (!isMounted && (user.dateJoined || user.lastLogin)) {
    return (
      <TableRow className="hover:bg-muted/50">
        <TableCell className="p-1 sm:p-2 md:p-4 w-[60px]">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10" data-ai-hint="person portrait">
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </TableCell>
        <TableCell className="font-medium p-1 sm:p-2 md:p-4">{user.name}</TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4 hidden xs:table-cell">{user.email}</TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">{user.role}</TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4"><Badge variant={statusBadgeVariant}>{user.status}</Badge></TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4 hidden md:table-cell">Loading...</TableCell>
        <TableCell className="p-1 sm:p-2 md:p-4 hidden lg:table-cell">Loading...</TableCell>
        <TableCell className="text-right p-1 sm:p-2 md:p-4 w-[80px]">
           <div className="h-8 w-8" /> 
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="p-1 sm:p-2 md:p-4 w-[60px]">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10" data-ai-hint="person portrait">
          <AvatarImage src={user.avatar || `https://placehold.co/40x40.png?text=${user.name.charAt(0)}`} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="font-medium p-1 sm:p-2 md:p-4">{user.name}</TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4 hidden xs:table-cell">{user.email}</TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">{user.role}</TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4">
        <Badge variant={statusBadgeVariant}>{user.status}</Badge>
      </TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4 hidden md:table-cell">{formattedDateJoined}</TableCell>
      <TableCell className="p-1 sm:p-2 md:p-4 hidden lg:table-cell">{formattedLastLogin}</TableCell>
      <TableCell className="text-right p-1 sm:p-2 md:p-4 w-[80px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function UserManagementPage() {
  const { users, addUser, updateUser, deleteUser, initialUsersLoaded } = useUserContext();
  const { roles: availableRolesData, initialRolesLoaded: rolesLoaded } = useRoleContext(); 
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();

  const availableRoles = React.useMemo(() => {
    if (!rolesLoaded) return [];
    return availableRolesData.map(role => role.name);
  }, [availableRolesData, rolesLoaded]);

  const handleSaveUser = (user: User) => {
    if (editingUser) {
      updateUser(user);
      toast({ title: "User Updated", description: `${user.name} has been successfully updated.` });
    } else {
      addUser(user);
      toast({ title: "User Added", description: `${user.name} has been successfully added.` });
    }
    setEditingUser(null);
    setIsFormOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    toast({ title: "User Deleted", description: `User has been successfully deleted.`, variant: "destructive" });
  };
  
  const filteredUsers = React.useMemo(() => {
    if (!initialUsersLoaded) return [];
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, initialUsersLoaded]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, users.length]);

  const totalUsers = filteredUsers.length;
  const totalPages = totalUsers > 0 ? Math.ceil(totalUsers / ITEMS_PER_PAGE) : 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const getStatusBadgeVariant = (status: User["status"]): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "Active": return "default";
      case "Inactive": return "secondary";
      case "Pending": return "outline";
      default: return "default";
    }
  };
  
  if (!initialUsersLoaded || !rolesLoaded) {
     return <p>Loading users and roles...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary tracking-tight">User Management</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingUser(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Modify the details of the existing user." : "Enter the details for the new user."}
              </DialogDescription>
            </DialogHeader>
            <UserForm user={editingUser} onSave={handleSaveUser} availableRoles={availableRoles} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search users..."
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
                <TableHead className="w-[60px] p-1 sm:p-2 md:p-4">Avatar</TableHead>
                <TableHead className="p-1 sm:p-2 md:p-4">Name</TableHead>
                <TableHead className="p-1 sm:p-2 md:p-4 hidden xs:table-cell">Email</TableHead>
                <TableHead className="p-1 sm:p-2 md:p-4 hidden sm:table-cell">Role</TableHead>
                <TableHead className="p-1 sm:p-2 md:p-4">Status</TableHead>
                <TableHead className="p-1 sm:p-2 md:p-4 hidden md:table-cell">Date Joined</TableHead>
                <TableHead className="p-1 sm:p-2 md:p-4 hidden lg:table-cell">Last Login</TableHead>
                <TableHead className="text-right w-[80px] p-1 sm:p-2 md:p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  statusBadgeVariant={getStatusBadgeVariant(user.status)}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {totalUsers === 0 && initialUsersLoaded && (
        <p className="text-center text-muted-foreground py-8">No users found.</p>
      )}
      {totalUsers > 0 && initialUsersLoaded && (
         <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
          <span className="text-sm text-muted-foreground">
            Page {totalUsers > 0 ? currentPage : 0} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalUsers === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalUsers === 0}
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
