
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
import { PlusCircle, Edit, Trash2, MoreHorizontal, Search } from "lucide-react";
import type { User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const initialUsers: User[] = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", role: "Administrator", status: "Active", avatar: "https://placehold.co/40x40.png?text=AW", lastLogin: new Date("2024-07-20T10:00:00Z"), dateJoined: new Date("2023-01-15T09:00:00Z") },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", role: "Travel Agent", status: "Active", avatar: "https://placehold.co/40x40.png?text=BB", lastLogin: new Date("2024-07-21T14:30:00Z"), dateJoined: new Date("2023-02-20T11:00:00Z") },
  { id: "3", name: "Charlie Chaplin", email: "charlie@example.com", role: "Support Staff", status: "Inactive", avatar: "https://placehold.co/40x40.png?text=CC", dateJoined: new Date("2023-03-10T16:00:00Z") },
  { id: "4", name: "Diana Prince", email: "diana@example.com", role: "Travel Agent", status: "Pending", avatar: "https://placehold.co/40x40.png?text=DP", dateJoined: new Date("2024-07-22T08:00:00Z") },
];

const UserForm = ({ user, onSave, availableRoles }: { user?: User | null, onSave: (user: User) => void, availableRoles: string[] }) => {
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [role, setRole] = React.useState(user?.role || availableRoles[0]);
  const [status, setStatus] = React.useState(user?.status || "Pending");

  const handleSubmit = () => {
    const newUser: User = {
      id: user?.id || Date.now().toString(),
      name,
      email,
      role,
      status: status as User["status"],
      dateJoined: user?.dateJoined || new Date(),
      lastLogin: user?.lastLogin 
    };
    onSave(newUser);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
        <Label htmlFor="name" className="sm:text-right">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-3" />
      </div>
      <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
        <Label htmlFor="email" className="sm:text-right">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="sm:col-span-3" />
      </div>
      <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
        <Label htmlFor="role" className="sm:text-right">Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="sm:col-span-3">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
        <Label htmlFor="status" className="sm:text-right">Status</Label>
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
      <DialogFooter>
        <DialogClose asChild>
           <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" onClick={handleSubmit}>Save user</Button>
      </DialogFooter>
    </div>
  );
};

interface UserTableRowProps {
  user: User;
  statusBadgeVariant: "default" | "secondary" | "outline";
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
    // To prevent layout shift during hydration, render placeholders or minimal content
    return (
      <TableRow className="hover:bg-muted/50">
        <TableCell className="p-2 sm:p-4">
          <Avatar className="h-10 w-10" data-ai-hint="person portrait">
            <AvatarImage src={user.avatar || `https://placehold.co/40x40.png?text=${user.name.charAt(0)}`} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </TableCell>
        <TableCell className="font-medium p-2 sm:p-4">{user.name}</TableCell>
        <TableCell className="p-2 sm:p-4">{user.email}</TableCell>
        <TableCell className="p-2 sm:p-4">{user.role}</TableCell>
        <TableCell className="p-2 sm:p-4">
          <Badge variant={statusBadgeVariant}>{user.status}</Badge>
        </TableCell>
        <TableCell className="p-2 sm:p-4 hidden sm:table-cell">Loading...</TableCell>
        <TableCell className="p-2 sm:p-4 hidden sm:table-cell">Loading...</TableCell>
        <TableCell className="text-right p-2 sm:p-4">
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
  }


  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="p-2 sm:p-4">
        <Avatar className="h-10 w-10" data-ai-hint="person portrait">
          <AvatarImage src={user.avatar || `https://placehold.co/40x40.png?text=${user.name.charAt(0)}`} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="font-medium p-2 sm:p-4">{user.name}</TableCell>
      <TableCell className="p-2 sm:p-4">{user.email}</TableCell>
      <TableCell className="p-2 sm:p-4">{user.role}</TableCell>
      <TableCell className="p-2 sm:p-4">
        <Badge variant={statusBadgeVariant}>{user.status}</Badge>
      </TableCell>
      <TableCell className="p-2 sm:p-4 hidden sm:table-cell">{formattedDateJoined}</TableCell>
      <TableCell className="p-2 sm:p-4 hidden sm:table-cell">{formattedLastLogin}</TableCell>
      <TableCell className="text-right p-2 sm:p-4">
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
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  const availableRoles = ["Administrator", "Travel Agent", "Support Staff", "Manager"];

  const handleSaveUser = (user: User) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
      toast({ title: "User Updated", description: `${user.name} has been successfully updated.` });
    } else {
      const newUserWithLastLogin = { ...user, lastLogin: user.lastLogin || undefined };
      setUsers([...users, newUserWithLastLogin]);
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
    setUsers(users.filter(u => u.id !== userId));
    toast({ title: "User Deleted", description: `User has been successfully deleted.`, variant: "destructive" });
  };
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: User["status"]) => {
    switch (status) {
      case "Active": return "default";
      case "Inactive": return "secondary";
      case "Pending": return "outline";
      default: return "default";
    }
  };

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
                <TableHead className="w-[60px] p-2 sm:p-4">Avatar</TableHead>
                <TableHead className="p-2 sm:p-4">Name</TableHead>
                <TableHead className="p-2 sm:p-4">Email</TableHead>
                <TableHead className="p-2 sm:p-4">Role</TableHead>
                <TableHead className="p-2 sm:p-4">Status</TableHead>
                <TableHead className="p-2 sm:p-4 hidden sm:table-cell">Date Joined</TableHead>
                <TableHead className="p-2 sm:p-4 hidden sm:table-cell">Last Login</TableHead>
                <TableHead className="text-right w-[80px] p-2 sm:p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
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
      {filteredUsers.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No users found.</p>
      )}
    </div>
  );
}
