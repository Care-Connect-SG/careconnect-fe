import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginForm from "./_components/login-form";

export default async function LoginPage() {
  // const session = await getServerSession(authOptions);

  // if (session) {
  //   redirect("/dashboard/home");
  // }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-blue-50 p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
