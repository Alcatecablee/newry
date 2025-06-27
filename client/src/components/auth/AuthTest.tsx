import { useAuth, useUser } from "@clerk/clerk-react";

export function AuthTest() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  console.log("🧪 AuthTest - isSignedIn:", isSignedIn, "user:", user);

  return (
    <div className="p-4 bg-gray-800 rounded-lg m-4">
      <h3 className="text-white text-lg mb-2">Auth Test Component</h3>
      <div className="text-sm text-gray-300">
        <p>Signed In: {isSignedIn ? "✅ YES" : "❌ NO"}</p>
        <p>
          User:{" "}
          {user
            ? `✅ ${user.firstName} (${user.primaryEmailAddress?.emailAddress})`
            : "❌ None"}
        </p>
        <p>User ID: {user?.id || "None"}</p>
        {isSignedIn && (
          <button
            onClick={() => signOut()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
