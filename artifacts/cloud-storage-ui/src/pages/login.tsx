import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
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
import { Link } from "wouter";
import { Cloud, Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoggingIn } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    login({ data });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="hidden md:flex flex-1 bg-primary flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-dots pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Cloud className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Cloud Storage</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mt-12 max-w-md">
            Your personal file vault, redefined.
          </h1>
          <p className="mt-6 text-xl text-primary-foreground/80 max-w-md">
            Secure, fast, and entirely yours. Store anything without worrying about external access.
          </p>
        </div>
        <div className="relative z-10 text-sm font-medium text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Cloud Storage. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-background to-muted pointer-events-none md:hidden"></div>
        
        <Card className="w-full max-w-md border-0 shadow-2xl bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
          <CardHeader className="space-y-2 pb-6">
            <div className="flex items-center gap-2 mb-2 md:hidden text-primary">
              <Cloud className="h-6 w-6" />
              <span className="font-bold tracking-tight">Cloud Storage</span>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} className="h-12 bg-background/50" />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} className="h-12 bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-base font-semibold mt-2" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center border-t border-border/40 pt-6 mt-2">
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline underline-offset-4">
                Create one now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
