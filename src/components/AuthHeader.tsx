"use client";

import { Calendar, LogOut, LogIn } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  if (status === "loading") {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Calendar App</h1>
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
    
    {/* Logo */}
    <div className="flex items-center gap-2">
      <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-2">
        <Calendar className="h-6 w-6 text-white" />
      </div>
      <Link href="/" className="text-xl sm:text-2xl font-bold text-slate-900">
        Calendar App
      </Link>
    </div>

    {/* User / Auth */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
      {session ? (
        <>
          <span className="text-sm text-gray-700 truncate max-w-[150px] sm:max-w-none">
            {session.user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-95 w-full sm:w-auto justify-center"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-95 w-full sm:w-auto justify-center"
        >
          Sign in
        </Link>
      )}
    </div>
  </div>
</header>

  );
}

