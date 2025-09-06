"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function loginAction(formData: FormData) {
  try {
    const res = await api.post<{ access_token: string }>("/auth/login", {
      email: formData.get("email"),
      password: formData.get("password"),
    });
    console.log(res.data); // success response
    const cookieStore = await cookies();
    cookieStore.set("token", res.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: "/",
      sameSite: "strict",
    });
    redirect("/");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error; // Re-throw redirect errors
    }
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data); // server response error
    } else {
      console.error(error); // other errors
    }
  }
}
