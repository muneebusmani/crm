"use server";

import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
    }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Login failed");

  redirect("/dashboard");
}
