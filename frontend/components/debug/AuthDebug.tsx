"use client";
import { useAuthState } from "@/stores/auth/authState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AuthDebug = () => {
  const { user, isAuthenticated, hydrated, pendingEmail } = useAuthState();

  // Only show in development
  if (process.env.NODE_ENV === "production") return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-stone-800 border-yellow-500 border-2 z-50">
      <CardHeader>
        <CardTitle className="text-yellow-500 text-sm">🐛 Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-white space-y-2">
        <div>
          <span className="font-semibold">Hydrated:</span> {hydrated ? "✅ Yes" : "❌ No"}
        </div>
        <div>
          <span className="font-semibold">Authenticated:</span>{" "}
          {isAuthenticated ? "✅ Yes" : "❌ No"}
        </div>
        <div>
          <span className="font-semibold">User:</span>{" "}
          {user ? `${user.firstName} ${user.lastName}` : "❌ None"}
        </div>
        <div>
          <span className="font-semibold">Email:</span> {user?.email || "❌ None"}
        </div>
        <div>
          <span className="font-semibold">Pending Email:</span> {pendingEmail || "❌ None"}
        </div>
        <div className="mt-2 pt-2 border-t border-stone-600">
          <span className="font-semibold">Cookie:</span>
          <div className="text-[10px] break-all mt-1">
            {typeof window !== "undefined" &&
              (document.cookie.includes("auth=") ? "✅ Set" : "❌ Not Set")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
