"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && session) {
      router.push("/dashboard/home");
    }
  }, [session, status, router]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      setLoading(false);

      if (!result || !result.ok) {
        return toast({
          variant: "destructive",
          title: "Login Failed",
          description:
            "Invalid credentials. Please ensure your login details are correct and try again",
        });
      }

      router.push("/dashboard/home");
    } catch (error) {
      setLoading(false);
      console.error("Error during login:", error);
      return toast({
        variant: "destructive",
        title: "An error occurred",
        description: (error as Error)?.message || "Please try again",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:p-12 space-y-6"
            >
              <div className="flex flex-col items-center text-center pb-6">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your CareConnect account
                </p>
              </div>
              <div className="grid gap-4">
                <Label htmlFor="email">Email</Label>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          {...field}
                          className={
                            fieldState.invalid
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* <Link
                    href="#"
                    className="ml-auto text-xs underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link> */}
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          required
                          placeholder="******"
                          {...field}
                          className={
                            fieldState.invalid
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                {loading ? <Spinner /> : "Login"}
              </Button>
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/login.jpg"
              alt="Login Cover"
              width={614}
              height={408}
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  );
}
