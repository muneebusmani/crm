"use server";

import { type LoginResponse, type User, UserType } from "@crm/types";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function loginAction(formData: FormData) {
  try {
    const res = await api.post<LoginResponse<User>>("/auth/login", {
      email: formData.get("email"),
      password: formData.get("password"),
    });
    const { data } = await res.data; // no need to await here
    console.log(res.data);

    const userType = data?.data.type as UserType;
    const token = data?.accessToken as string;

    // expiry values in seconds (to match cookie maxAge)
    const expiryMap: Record<UserType | "DEFAULT", number> = {
      [UserType.ADMIN]: 24 * 60 * 60, // 24 hrs
      [UserType.DEALER]: 7 * 24 * 60 * 60, // 7 days
      DEFAULT: 8 * 60 * 60, // 8 hrs
    };

    const expiry = expiryMap[userType] ?? expiryMap.DEFAULT;

    const cookieStore = await cookies();
    const commonOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiry,
      path: "/",
      sameSite: "strict" as const,
    };

    cookieStore.set("token", token, commonOptions);
    cookieStore.set("user_type", userType, commonOptions);

    const redirectMap: Record<UserType, string> = {
      [UserType.ADMIN]: "/admin",
      [UserType.DEALER]: "/dealer",
    };

    const target = redirectMap[userType];
    if (target) {
      redirect(target);
    }

    // console.log(await res.data);
    // const data = (await res.data).data;
    // const userType = data?.data.type as UserType;
    // const token = data?.accessToken as string;
    //
    // const expiryMap: Record<UserType | "DEFAULT", number> = {
    //   [UserType.ADMIN]: 24 * 60 * 60, // 24 hrs
    //   [UserType.DEALER]: 7 * 24 * 60 * 60, // 7 days
    //   DEFAULT: 8 * 60 * 60 * 1000, // 8 hrs
    // };
    //
    // const expiry = expiryMap[userType] ?? expiryMap.DEFAULT;
    //
    // const cookieStore = await cookies();
    // cookieStore.set("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: expiry,
    //   path: "/",
    //   sameSite: "strict",
    // });
    // cookieStore.set("user_type", userType, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: expiry,
    //   path: "/",
    //   sameSite: "strict",
    // });
    // if (userType === UserType.DEALER) {
    //   redirect("/dealer");
    // } else if (userType === UserType.ADMIN) {
    //   redirect("/admin");
    // }
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
