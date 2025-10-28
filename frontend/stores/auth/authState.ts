import { ROLE } from "@/enum/role";
import { AuthState } from "@/types/user/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper function to update cookie
const updateAuthCookie = (state: Partial<AuthState>) => {
  if (typeof window !== "undefined") {
    const cookieData = {
      state: {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingEmail: state.pendingEmail,
      },
      version: 0,
    };
    const serializedState = JSON.stringify(cookieData);
    document.cookie = `auth=${encodeURIComponent(
      serializedState,
    )}; path=/; expires=Thu, 01 Jan 2050 00:00:00 UTC; sameSite=Lax`;
  }
};

export const useAuthState = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      pendingEmail: null,
      hydrated: false,

      setUser: (user) => {
        set({ user });
        // Update cookie when user changes
        updateAuthCookie({
          user,
          isAuthenticated: get().isAuthenticated,
          pendingEmail: get().pendingEmail,
        });
      },
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
        const state = get();
        updateAuthCookie({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          pendingEmail: state.pendingEmail,
        });
      },
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
        const state = get();
        updateAuthCookie({ user: state.user, isAuthenticated, pendingEmail: state.pendingEmail });
      },
      setPendingVerification: (email) => {
        set({ pendingEmail: email });
        const state = get();
        updateAuthCookie({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          pendingEmail: email,
        });
      },
      setEmailVerified: (emailVerified) => {
        set((state) => ({
          user: state.user ? { ...state.user, emailVerified } : null,
        }));
        const state = get();
        updateAuthCookie({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          pendingEmail: state.pendingEmail,
        });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, pendingEmail: null });
        // Clear the auth cookie
        if (typeof window !== "undefined") {
          document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        }
      },
      setHydrated: (hydrated) => set({ hydrated: true }),
      me: async () => {
        // TODO: Implement API call
        return null;
      },

      needsEmailVerifcation: () => !!get().user?.emailVerified,
      isAdmin: () => get().user?.role === ROLE.ADMIN,
      getUserRole: () => get().user?.role || ROLE.USER,
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
          updateAuthCookie({
            user: state.user,
            isAuthenticated: state.isAuthenticated,
            pendingEmail: state.pendingEmail,
          });
        }

        if (state) {
          state.setHydrated(true);
        }
      },
    },
  ),
);
