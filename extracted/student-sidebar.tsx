import { Link, useLocation } from "react-router-dom";
import {
  BookIcon,
  FileTextIcon,
  HomeIcon,
  HelpCircleIcon,
  UserIcon,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Logo from "@/polymet/components/logo";

interface StudentSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function StudentSidebar({
  open = true,
  onOpenChange,
}: StudentSidebarProps) {
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <Link
            to="/student/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/student/dashboard")
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
            to="/student/applications"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/student/applications")
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
            to="/student/saved"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/student/saved")
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
              {open && "Saved Programs"}
            </span>
          </Link>
          <div
            className={cn("my-2 border-t", open ? "opacity-100" : "opacity-0")}
          ></div>
          <Link
            to="/student/profile"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/student/profile")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <UserIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Profile"}
            </span>
          </Link>
          <Link
            to="/student/notifications"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-black/5",
              isActive("/student/notifications")
                ? "bg-black text-white hover:bg-black/90"
                : "text-black"
            )}
          >
            <BellIcon className="h-4 w-4" />
            <span
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              {open && "Notifications"}
            </span>
          </Link>
          <Link
            to="/student/support"
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
            <AvatarImage src="https://github.com/yusufhilmi.png" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "flex flex-col transition-opacity",
              open ? "opacity-100" : "opacity-0"
            )}
          >
            {open && (
              <>
                <span className="text-sm font-medium text-black">John Doe</span>
                <span className="text-xs text-gray-500">
                  john.doe@example.com
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
              <Link to="/student/settings">
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
