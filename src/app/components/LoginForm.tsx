import { useState } from "react";
import FormInput from "./FormInput";
import FormError from "./FormError";
import useLogin from "../hooks/useLogin";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && <FormError message={error} />}
      <div className="space-y-4">
        <FormInput id="email" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormInput id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}
