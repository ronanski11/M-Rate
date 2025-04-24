"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  House,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/logo.png";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { getUsername, isAdmin } from "@/lib/token-functions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SearchBar from "./searchbar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const pathname = usePathname();
  const [username, setUsername] = useState(""); // Initialize as empty string
  const [initialLetter, setInitialLetter] = useState(""); // Store initial letter separately

  useEffect(() => {
    if (typeof window !== "undefined") {
      const usernameValue = getUsername() || "";
      setUsername(usernameValue);
      // Safely extract the initial letter if the username exists and has a character after index 1
      setInitialLetter(
        usernameValue && usernameValue.length > 1
          ? usernameValue[0].toUpperCase()
          : ""
      );
      setIsAdminUser(isAdmin());
    }
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: <House /> },
    { href: "/watchlist", label: "Watchlist", icon: <Bookmark /> },
  ];

  const adminLinks = [];

  const isActive = (href) => {
    return pathname === href;
  };

  const logout = () => {
    document.cookie = `accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    window.location.href = "/login";
  };

  const profilePic = (
    <Avatar style={{ height: "2.5rem", width: "2.5rem" }}>
      <AvatarFallback>{initialLetter}</AvatarFallback>
    </Avatar>
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdminUser(isAdmin());
    }
  }, []);

  const LogoutDialog = () => (
    <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
      <DialogContent className="w-[300px] rounded-md">
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogDescription>
            Are you sure you want to log out?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-center gap-3 mt-4 w-full">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={logout}>
              Yes, log out
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center mx-auto border-b dark:border-zinc-800 border-gray-200 fixed w-full top-0 z-[10] max-w-[1400px] backdrop-blur supports-[padding-top:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)] dark:bg-transparent bg-white">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[300px] sm:w-[400px] bg-white dark:bg-black mt-14 [&_button]:hidden border-gray-600"
        >
          <SheetTitle />
          <SheetDescription />
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 py-2 px-3 transition-colors ${
                  isActive(link.href)
                    ? "bg-gray-100 dark:bg-gray-800 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
            {isAdminUser && (
              <>
                <hr className="border-gray-200 dark:border-gray-600" />
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 py-2 px-3 rounded-md transition-colors ${
                      isActive(link.href)
                        ? "bg-gray-100 dark:bg-gray-800 text-primary"
                        : "hover:bg-gray-50 dark:hover:bg-gray-900"
                    }`}
                  >
                    {link.icon}
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      <Link className="flex items-center justify-center mr-6" href="/">
        <Image src={logo.src} alt="Allzinator Logo" width={30} height={30} />
        <span className="ml-2 text-2xl font-bold leading-none">M-Rate</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="ml-auto hidden lg:flex items-center gap-4 sm:gap-6">
        <SearchBar
          small={true}
          height="py-4"
          flex="flex"
          width="w-80"
          classes={"z-20"}
        />
        {navLinks.map(
          (link) =>
            link.label !== "Home" && (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-gray-100 dark:bg-gray-800 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                {link.icon}
                <span className="text-nowrap">{link.label}</span>
              </Link>
            )
        )}
        {isAdminUser &&
          adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-gray-100 dark:bg-gray-800 text-primary"
                  : "hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        <ModeToggle />
        <div className="ml-auto flex not-odd:items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              {profilePic}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 mr-2" sideOffset={8}>
              <div className="flex flex-col p-2">
                <span className="text-sm font-bold text-center">
                  {username}
                </span>
              </div>
              <DropdownMenuSeparator />

              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer flex items-center p-2">
                  <User className="w-4 h-4 mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>

              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer flex items-center p-2">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950  flex items-center p-2"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Mobile Navigation Icons */}
      <div className="ml-auto flex lg:hidden items-center gap-4">
        <Link href={"/search"}>
          <Search />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            {profilePic}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 mr-2" sideOffset={8}>
            <div className="flex flex-col p-2">
              <span className="text-sm font-bold">{username}</span>
            </div>
            <DropdownMenuSeparator />

            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer flex items-center p-2">
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>

            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer flex items-center p-2">
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />

            <div className="p-2">
              <ModeToggle className="w-full" />
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950  flex items-center p-2"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LogoutDialog />
    </header>
  );
}
