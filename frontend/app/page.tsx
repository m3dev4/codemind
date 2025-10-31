"use client";
import { Button } from "@/components/ui/button";
import { codemindLogo } from "@/public/imgs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const NavLinks = [
  {
    id: 1,
    name: "Accueil",
    href: "/",
  },
  {
    id: 2,
    name: "Fonctionnalités",
    href: "/features",
  },
  {
    id: 3,
    name: "Pricing",
    href: "/pricing",
  },
  {
    id: 4,
    name: "Contact",
    href: "/contact",
  },
];

const HomePage = () => {
  const router = useRouter();
  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto">
        <div className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src={codemindLogo} alt="Codemind Logo" height={60} width={60} />
              <h1 className="text-white font-sora font-bold uppercase mt-2 tracking-widest">
                Codemind
              </h1>
            </div>

            <div className="flex items-center justify-center gap-7">
              {NavLinks.map((link) => (
                <div key={link.id}>
                  <Link href={link.href}>
                    <span className="text-white font-light font-sora hover:text-secondary transition-colors">
                      {link.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>

            <Button
              className="rounded-lg border-0 outline-none cursor-pointer transform hover:scale-101 transition-transform"
              onClick={() => router.push("/auth/sign-up")}
            >
              <span className="font-bold uppercase tracking-wider">Essayez gratuitement</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
