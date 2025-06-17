
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
import { PlusCircle, Edit, Trash2, MoreHorizontal, Search } from "lucide-react";
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
import { useRoleContext } from "@/contexts/RoleContext";

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

  React.useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setSelectedPermissions(role.permissions);
    } else {
      setName("");
      setDescription("");
      setSelectedPermissions([]);
    }
  }, [role]);

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
      <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
        <Label htmlFor="roleName" className="sm:text-right text-left">Role Name</Label>
        <Input id="roleName" value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-3" />
      </div>
      <div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
        <Label htmlFor="description" className="sm:text-right text-left sm:pt-2">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="sm:col-span-3 min-h-[80px]" />
      </div>
      <div className="grid gap-2 sm:grid-cols-4 sm:items-start sm:gap-4">
        <Label className="sm:text-right text-left sm:pt-2">Permissions</Label>
        <div className="sm:col-span-3 space-y-2 max-h-60 overflow-y-auto p-1 border rounded-md">
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
      <DialogFooter className="pt-4">
         <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
         </DialogClose>
        <Button type="submit" onClick={handleSubmit}>Save role</Button>
      </DialogFooter>
    </div>
  );
};

export default function RoleManagementPage() {
  const { roles, addRole, updateRole, deleteRole, initialRolesLoaded } = useRoleContext();
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { toast } = useToast();

  const handleSaveRole = (role: Role) => {
    if (editingRole) {
      updateRole(role);
      toast({ title: "Role Updated", description: `Role '${role.name}' has been successfully updated.` });
    } else {
      addRole(role);
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
    deleteRole(roleId);
    toast({ title: "Role Deleted", description: `Role has been successfully deleted.`, variant: "destructive" });
  };
  
  const filteredRoles = React.useMemo(() => {
    if(!initialRolesLoaded) return [];
    return roles.filter(role => 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm, initialRolesLoaded]);

  if (!initialRolesLoaded) {
    return <p>Loading roles...</p>; // Or a more sophisticated loading skeleton
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Role Management</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingRole(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingRole(null); setIsFormOpen(true); }} className="w-full sm:w-auto">
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
          className="pl-10 w-full md:w-1/2 lg:w-1/3"
        />
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="p-2 sm:p-4">Role Name</TableHead>
                <TableHead className="p-2 sm:p-4 hidden sm:table-cell">Description</TableHead>
                <TableHead className="p-2 sm:p-4">Permissions</TableHead>
                <TableHead className="text-right w-[80px] p-2 sm:p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium p-2 sm:p-4">{role.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate p-2 sm:p-4 hidden sm:table-cell">{role.description}</TableCell>
                  <TableCell className="p-2 sm:p-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0,3).map(permission => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {allPermissions.find(p => p.id === permission)?.label || permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && <Badge variant="secondary">+{role.permissions.length -3} more</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-2 sm:p-4">
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
       {filteredRoles.length === 0 && initialRolesLoaded &&(
        <p className="text-center text-muted-foreground py-8">No roles found.</p>
      )}
    </div>
  );
}
