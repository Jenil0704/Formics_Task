import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignupData {
  name?: string;
  email: string;
  password: string;
}

export default function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const signup = async (data: SignupData) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to create account");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error, setError };
}
