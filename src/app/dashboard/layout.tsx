
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/dashboard/user-nav";
import { LayoutDashboard, Users, ShieldCheck, ShipWheel, PlaneTakeoff, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProvider } from "@/contexts/UserContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { DestinationProvider } from "@/contexts/DestinationContext";
import { VoyageProvider } from "@/contexts/VoyageContext";


const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "User Management", icon: Users },
  { href: "/dashboard/roles", label: "Role Management", icon: ShieldCheck },
  { href: "/dashboard/voyages", label: "Voyage Management", icon: PlaneTakeoff },
  { href: "/dashboard/destinations", label: "Destination Management", icon: MapPin },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <UserProvider>
      <RoleProvider>
        <DestinationProvider>
          <VoyageProvider>
            <SidebarProvider>
              <div className="flex min-h-screen">
                <Sidebar collapsible="icon">
                  <SidebarHeader className="p-4">
                    <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
                      <ShipWheel className="h-8 w-8 text-primary flex-shrink-0" />
                      <h1 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden whitespace-nowrap">
                        Voyage Control
                      </h1>
                    </Link>
                  </SidebarHeader>
                  <SidebarContent>
                    <ScrollArea className="h-full">
                      <SidebarMenu className="p-2">
                        {navItems.map((item) => (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              asChild
                              isActive={isMounted ? pathname === item.href : false}
                              tooltip={item.label}
                              className={cn(
                                "justify-start",
                                isMounted && pathname === item.href && "bg-primary/10 text-primary hover:bg-primary/20"
                              )}
                            >
                              <Link href={item.href}>
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </ScrollArea>
                  </SidebarContent>
                  <SidebarFooter className="p-2 mt-auto border-t border-border">
                     <div className="hidden md:flex w-full items-center group-data-[state=collapsed]:justify-center group-data-[state=expanded]:justify-end">
                        <SidebarTrigger />
                     </div>
                  </SidebarFooter>
                </Sidebar>
                <SidebarInset className="flex-1 flex flex-col">
                  <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
                    <div className="md:hidden">
                      <SidebarTrigger />
                    </div>
                    <div className="hidden md:block">
                      {/* Placeholder for breadcrumbs or page title if needed */}
                    </div>
                    <div className="flex items-center gap-4">
                      <ModeToggle />
                      <UserNav />
                    </div>
                  </header>
                  <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </VoyageProvider>
        </DestinationProvider>
      </RoleProvider>
    </UserProvider>
  );
}
