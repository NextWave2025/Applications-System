import { Link, useLocation } from "react-router-dom";
import {
  BarChartIcon,
  BookIcon,
  BriefcaseIcon,
  BuildingIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  HelpCircleIcon,
  HomeIcon,
  LogOutIcon,
  PackageIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Logo from "@/polymet/components/logo";

interface AdminSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AdminSidebar({
  open = true,
  onOpenChange,
}: AdminSidebarProps) {
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
            to="/admin/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/admin/dashboard")
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
            to="/admin/my-applications"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/admin/my-applications")
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
              {open && "My Applications"}
            </span>
          </Link>
          <Link
            to="/admin/universities"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/admin/universities")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <BuildingIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Universities"}
            </span>
          </Link>
          <Link
            to="/admin/programs"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/admin/programs")
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
            to="/admin/agents"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/admin/agents")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <BriefcaseIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Agents"}
            </span>
          </Link>
          <Link
            to="/admin/students"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/admin/students")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <UsersIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Students"}
            </span>
          </Link>
          <Link
            to="/admin/commissions"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/admin/commissions")
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
          <Link
            to="/admin/analytics"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/admin/analytics")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <BarChartIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Analytics"}
            </span>
          </Link>
          <Link
            to="/admin/control"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/admin/control")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <SettingsIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Admin Control"}
            </span>
          </Link>
          <div
            className={cn("my-2 border-t", open ? "opacity-100" : "opacity-0")}
          ></div>
          <Link
            to="/admin/support"
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
            <AvatarImage src="https://github.com/furkanksl.png" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
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
                  Admin User
                </span>
                <span className="text-xs text-gray-500">
                  admin@uaeadmissions.com
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
              <Link to="/admin/profile">
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
              <Link to="/admin/settings">
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
