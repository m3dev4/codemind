"use client";

import { useAuthState } from "@/stores/auth/authState";
import { parametresNav } from "@/constants/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ParametreLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthState();
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full overflow-auto">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-sora text-3xl font-bold mb-2">Paramètres</h1>
          <p className="text-muted-foreground text-sm">Gérez votre compte et vos préférences</p>
        </div>

        <div className="border-b border-border mb-8 sticky top-0 z-10 bg-neutral-900 py-2">
          <nav className="flex gap-8 overflow-x-auto">
            {parametresNav(user?.firstName || "", user?.id || "").map((nav) => {
              const isActive = pathname === nav.href;
              return (
                <Link
                  key={nav.id}
                  href={nav.href}
                  className={`
                    relative pb-4 px-1 font-medium text-sm whitespace-nowrap transition-colors
                    ${isActive ? "text-secondary" : "text-muted-foreground hover:text-white"}
                  `}
                >
                  {nav.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="animate-in fade-in duration-300 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default ParametreLayout;
