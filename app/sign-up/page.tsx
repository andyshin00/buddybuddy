"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const { error } = await authClient.signUp.email({
      name: name,
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message ?? "Sign up failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto my-10 max-w-sm px-4 w-full">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            placeholder="Jordan Lee"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            placeholder="name@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        <Field orientation="horizontal">
          <Button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
