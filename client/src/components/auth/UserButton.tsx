import { useState } from "react";
import { useAuth } from "@/providers/ClerkProvider";

export function UserButton() {
  const [showMenu, setShowMenu] = useState(false);
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-gray-300">
        U
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-semibold hover:bg-blue-700 transition-colors"
      >
        {user.name.charAt(0).toUpperCase()}
      </button>

      {showMenu && (
        <div className="absolute right-0 top-10 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg w-48 z-50">
          <div className="p-3 border-b border-zinc-800">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-zinc-400">{user.email}</p>
          </div>
          <button
            onClick={() => {
              signOut();
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
