
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShipWheel } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for login logic
    console.log("Login attempt with:", { email, password });
    // In a real app, you would implement actual authentication here
    // For now, we simulate a successful login by redirecting to the dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 selection:bg-primary/20 selection:text-primary">
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <ShipWheel className="h-7 w-7 sm:h-8 sm:w-8" />
          <span className="text-xl sm:text-2xl font-bold">Voyage Control</span>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-2xl rounded-lg">
        <CardHeader className="space-y-1 text-center p-6 sm:p-8">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="user@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#" // Placeholder for forgot password
                  className="text-sm text-primary hover:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 sm:p-8 pt-2 sm:pt-4">
            <Button type="submit" className="w-full h-12 text-base font-semibold">
              Login
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="#" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
       <footer className="absolute bottom-4 text-center text-xs text-muted-foreground w-full px-4">
        &copy; {new Date().getFullYear()} Voyage Control. All rights reserved.
      </footer>
    </div>
  );
}
