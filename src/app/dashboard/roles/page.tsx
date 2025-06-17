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
import { PlusCircle, Edit, Trash2, MoreHorizontal, CheckSquare, Square, Search } from "lucide-react";
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

const initialRoles: Role[] = [
  { id: "1", name: "Administrator", description: "Full access to all system features.", permissions: ["manage_users", "manage_roles", "manage_voyages", "view_reports"] },
  { id: "2", name: "Travel Agent", description: "Manages voyages and bookings.", permissions: ["manage_voyages", "view_bookings"] },
  { id: "3", name: "Support Staff", description: "Assists users and manages support tickets.", permissions: ["view_users", "manage_support_tickets"] },
];

const allPermissions = [
  { id: "manage_users", label: "Manage Users" },
  { id: "manage_roles", label: "Manage Roles" },
  { id: "manage_voyages", label: "Manage Voyages" },
  { id: "view_reports", label: "View Reports" },
  { id: "view_bookings", label: "View Bookings" },
  { id: "manage_support_tickets", label: "Manage Support Tickets" },
];

const RoleForm = ({ role, onSave }: { role?: Role | null, onSave: (role: Role) => void }) => {
  const [name, setName] = React.useState(role?.name || "");
  const [description, setDescription] = React.useState(role?.description || "");
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(role?.permissions || []);

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
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
    <div className="grid gap-6 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="roleName" className="text-right">Role Name</Label>
        <Input id="roleName" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="description" className="text-right pt-2">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3 min-h-[80px]" />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2">Permissions</Label>
        <div className="col-span-3 space-y-2 max-h-60 overflow-y-auto p-1 border rounded-md">
          {allPermissions.map(permission => (
            <div key={permission.id} className="flex items-center space-x-2">
              <Checkbox
                id={`perm-${permission.id}`}
                checked={selectedPermissions.includes(permission.id)}
                onCheckedChange={() => handlePermissionChange(permission.id)}
              />
              <Label htmlFor={`perm-${permission.id}`} className="font-normal cursor-pointer">{permission.label}</Label>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter>
         <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
         </DialogClose>
        <Button type="submit" onClick={handleSubmit}>Save role</Button>
      </DialogFooter>
    </div>
  );
};

export default function RoleManagementPage() {
  const [roles, setRoles] = React.useState<Role[]>(initialRoles);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  const handleSaveRole = (role: Role) => {
    if (editingRole) {
      setRoles(roles.map(r => r.id === role.id ? role : r));
      toast({ title: "Role Updated", description: `Role '${role.name}' has been successfully updated.` });
    } else {
      setRoles([...roles, role]);
      toast({ title: "Role Added", description: `Role '${role.name}' has been successfully added.` });
    }
    setEditingRole(null);
    setIsFormOpen(false);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(r => r.id !== roleId));
    toast({ title: "Role Deleted", description: `Role has been successfully deleted.`, variant: "destructive" });
  };
  
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Role Management</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingRole(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingRole(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
              <DialogDescription>
                {editingRole ? "Modify the details of the existing role." : "Define a new role and its permissions."}
              </DialogDescription>
            </DialogHeader>
            <RoleForm role={editingRole} onSave={handleSaveRole} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-1/3"
        />
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0,3).map(permission => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {allPermissions.find(p => p.id === permission)?.label || permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && <Badge variant="secondary">+{role.permissions.length -3} more</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRole(role)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRole(role.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
       {filteredRoles.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No roles found.</p>
      )}
    </div>
  );
}
