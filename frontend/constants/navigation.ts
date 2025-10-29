export const navigations = [
  {
    id: 1,
    name: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    id: 2,
    name: "Projets",
    href: "/projets",
    icon: " 📁",
  },
  {
    id: 3,
    name: "Analyse IA",
    href: "/analyse-ia",
    icon: " 🧠",
  },
  {
    id: 4,
    name: "Chat IA",
    href: "/chat",
    icon: "💬",
  },
  {
    id: 5,
    name: "Workflow                                  ",
    href: "/workflow",
    icon: "🕸️",
  },
];

export const navigationsFooter = (firstName: string, id: string) => [
  {
    id: 1,
    name: "Paramètres",
    href: `/parametres/${firstName}/${id}`,
    icon: "⚙️",
  },
  {
    id: 2,
    name: "Profil",
    href: "/profil",
    icon: "👤",
  },
];
