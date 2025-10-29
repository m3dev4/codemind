import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { User2, ChevronUp } from "lucide-react";
import Image from "next/image";
import { codemindLogo } from "@/public/imgs";
import { navigations, navigationsFooter } from "@/constants/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthState } from "@/stores/auth/authState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();
  const { user } = useAuthState();

  if (!user) {
    return null;
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className={cn(
        `border-r border-neutral-800 bg-neutral-950 flex items-center justify-center ${isCollapsed ? "flex items-center justify-center" : ""}`,
      )}
    >
      <SidebarHeader className="border-b border-neutral-800 p-4">
        <div className="flex items-center justify-between w-full">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <Image src={codemindLogo} alt="CodeMind Logo" width={30} height={30} />
              <h2 className="text-lg font-semibold text-white">CodeMind</h2>
            </div>
          ) : (
            <Image
              src={codemindLogo}
              alt="CodeMind Logo"
              width={24}
              height={24}
              className="mx-auto"
            />
          )}
          {!isCollapsed && <SidebarTrigger className="ml-auto" />}
        </div>
        {isCollapsed && (
          <div className="mt-2 flex justify-center">
            <SidebarTrigger />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="py-4 px-2">
        <SidebarGroup>
          <SidebarMenu>
            {navigations.map((nav) => (
              <SidebarMenuItem key={nav.id}>
                <SidebarMenuButton
                  asChild
                  tooltip={nav.name}
                  isActive={pathname === nav.href}
                  className={cn(
                    "text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors",
                    pathname === nav.href && "bg-neutral-900 text-white font-semibold",
                  )}
                >
                  <Link href={nav.href}>
                    <span className="text-lg">{nav.icon}</span>
                    <span className="font-sora">{nav.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-neutral-800 px-2 py-2">
        <SidebarGroup>
          <SidebarMenu>
            {navigationsFooter(user?.firstName, user?.id).map((nav) => (
              <SidebarMenuItem key={nav.id}>
                <SidebarMenuButton
                  asChild
                  tooltip={nav.name}
                  isActive={pathname === nav.href}
                  className={cn(
                    "text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors",
                    pathname === nav.href && "bg-neutral-900 text-white font-semibold",
                  )}
                >
                  <Link href={nav.href}>
                    <span className="text-lg">{nav.icon}</span>
                    <span className="font-sora">{nav.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {user && (
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Account"
                      className="text-neutral-300 hover:bg-neutral-900 hover:text-white"
                    >
                      <User2 className="h-4 w-4" />
                      <span className="font-sora">{user?.username}</span>
                      <ChevronUp className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="end"
                    className="w-[200px] bg-neutral-900 border-neutral-800"
                  >
                    <DropdownMenuItem className="text-white hover:bg-neutral-800 cursor-pointer">
                      <Button
                        variant="destructive"
                        onClick={() => {}}
                        className="w-full hover:bg-none"
                      >
                        Se deconnecter
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
