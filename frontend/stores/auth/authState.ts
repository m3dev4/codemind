import { ROLE } from "@/enum/role";
import { AuthState } from "@/types/user/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthState = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      pendingEmail: null,
      hydrated: false,

      setUser: (user) => set({ user }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error) => set({ error }),
      setPendingVerification: (email) => set({ pendingEmail: email }),
      setEmailVerified: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setHydrated: (hydrated) => set({ hydrated: true }),

      needsEmailVerifcation: () => !!get().user?.emailVerified,
      isAdmin: () => get().user?.role === ROLE.ADMIN,
      getUserRole: () => get().user?.role,
    }),
    {
      name: "auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingEmail: state.pendingEmail,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error(error);
        } else {
          console.log(state);
        }

        if (state && typeof window !== "undefined") {
          const serializedState = JSON.stringify({ state, version: 0 });
          document.cookie = `auth=${encodeURIComponent(
            serializedState
          )}; path=/; expires=Thu, 01 Jan 2050 00:00:00 UTC; sameSite=Lax; secure; httpOnly`;
        }

        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
