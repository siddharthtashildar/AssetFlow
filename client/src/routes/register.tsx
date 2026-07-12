import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { signup, getSystemStatus, getCurrentUser } from "../lib/api";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.string().optional(),
});

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["systemStatus"],
    queryFn: () => getSystemStatus(),
  });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setLoading(true);
    setError(null);
    try {
      await signup(values);
      toast.success("Account created successfully!");
      if (isAdmin) {
        toast.info(`Registered ${values.name} with role ${values.role}`);
        form.reset({
          name: "",
          email: "",
          password: "",
          role: "EMPLOYEE",
        });
      } else {
        router.navigate({ to: "/login" });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      toast.error("Registration failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (isLoadingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Checking system status...</span>
        </div>
      </div>
    );
  }

  // If system has users and current visitor is not logged in as Admin: block registration!
  if (statusData?.hasUsers && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-2 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">Access Restricted</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Public registration is disabled. Only system administrators can register new employees and assign roles.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2 text-center text-sm">
            <Link to="/login" className="w-full">
              <Button className="w-full">Go to Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 font-semibold">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <span className="text-xl tracking-tight">AssetFlow</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isAdmin ? "Register Employee" : "Setup Administrator"}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Create a new employee profile and select their authorization role."
              : "System bootstrap: Initialize the root Administrator account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isAdmin && (
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          <SelectItem value="ASSET_MANAGER">Asset Manager</SelectItem>
                          <SelectItem value="DEPARTMENT_HEAD">Department Head</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Processing..." : isAdmin ? "Register Employee" : "Create Admin Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center text-sm w-full">
          {isAdmin ? (
            <Link to="/" className="font-semibold text-primary hover:underline">
              Back to Dashboard
            </Link>
          ) : (
            <div className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
