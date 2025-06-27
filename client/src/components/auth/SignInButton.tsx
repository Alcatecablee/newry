import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useAuth } from "@/providers/ClerkProvider";

export function SignInButton() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signIn(email, password);
    if (success) {
      setShowForm(false);
      setEmail("");
      setPassword("");
    }
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 w-96">
          <h2 className="text-xl font-semibold text-white mb-4">Sign In</h2>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any password"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Sign In
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
          <p className="text-xs text-zinc-500 mt-2">
            Demo: Enter any email and password to sign in
          </p>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      className="font-semibold"
      onClick={() => setShowForm(true)}
    >
      <LogIn className="w-4 h-4 mr-2" />
      Sign In
    </Button>
  );
}
