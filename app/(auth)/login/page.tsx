"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();

  return (
    <Card className="p-6">
      <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-2">
        Log in to reach your contracts and messages.
      </p>

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/dashboard");
        }}
      >
        <Field label="Work email" required>
          <Input name="email" type="email" placeholder="you@company.com" required />
        </Field>
        <Field label="Password" required>
          <Input name="password" type="password" required />
        </Field>
        <Button type="submit" className="w-full" size="lg">
          Log in
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-3">
        New here?{" "}
        <Link href="/signup" className="text-brand-soft hover:text-ink">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
