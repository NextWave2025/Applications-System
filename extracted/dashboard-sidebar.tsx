import { Link, useLocation } from "react-router-dom";
import {
  BookIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  HelpCircleIcon,
  HomeIcon,
  LogOutIcon,
  MessageSquareIcon,
  PackageIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Logo from "@/polymet/components/logo";

interface DashboardSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DashboardSidebar({
  open = true,
  onOpenChange,
}: DashboardSidebarProps) {
  const location = useLocation();

  const toggleSidebar = () => {
    if (onOpenChange) {
      onOpenChange(!open);
    }
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-white transition-all",
        open ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div
          className={cn(
            "transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
        >
          {open && <Logo />}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-black"
          onClick={toggleSidebar}
        >
          {open ? (
            <ChevronLeftIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/dashboard") &&
                !isActive("/dashboard/programs") &&
                !isActive("/dashboard/applications") &&
                !isActive("/dashboard/commissions")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <HomeIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Dashboard"}
            </span>
          </Link>
          <Link
            to="/dashboard/programs"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/dashboard/programs")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <BookIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Programs"}
            </span>
          </Link>
          <Link
            to="/dashboard/applications"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/dashboard/applications")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <FileTextIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Applications"}
            </span>
          </Link>
          <Link
            to="/dashboard/commissions"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/dashboard/commissions")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <PackageIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Commissions"}
            </span>
          </Link>
          <div
            className={cn("my-2 border-t", open ? "opacity-100" : "opacity-0")}
          ></div>
          <Link
            to="/dashboard/marketing"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-black transition-all hover:bg-black/5"
          >
            <MessageSquareIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Marketing"}
            </span>
          </Link>
          <Link
            to="/dashboard/documents"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-black transition-all hover:bg-black/5"
          >
            <FileTextIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Visa Documents"}
            </span>
          </Link>
          <Link
            to="/dashboard/support"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-black transition-all hover:bg-black/5"
          >
            <HelpCircleIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Support"}
            </span>
          </Link>
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://github.com/furkanksl.png" alt="User" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "flex flex-col transition-opacity",
              open ? "opacity-100" : "opacity-0"
            )}
          >
            {open && (
              <>
                <span className="text-sm font-medium text-black">
                  Sarah Ahmed
                </span>
                <span className="text-xs text-gray-500">
                  Global Education Agency
                </span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-black"
              asChild
            >
              <Link to="/dashboard/profile">
                <UserIcon className="h-4 w-4" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-black"
              asChild
            >
              <Link to="/dashboard/settings">
                <SettingsIcon className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-black"
              asChild
            >
              <Link to="/login">
                <LogOutIcon className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
