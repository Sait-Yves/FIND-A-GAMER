"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  Gamepad2,
  Trophy,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onClose?.();
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Erreur déconnexion:", e);
    }
  };

  const navItems = [
    {
      label: "Explorer les Salons",
      href: "/",
      Icon: LayoutDashboard,
      active:
        pathname === "/" ||
        (pathname.startsWith("/tickets") && !pathname.includes("my-tickets")),
    },
    {
      label: "Mes Tickets",
      href: "/my-tickets",
      Icon: Ticket,
      badge: "2",
      active: pathname === "/my-tickets",
    },
    {
      label: "Messagerie & Voc",
      href: "/messages",
      Icon: MessageSquare,
      badge: "3",
      active: pathname === "/messages",
    },
    {
      label: "Jeux Favoris",
      href: "/favorites",
      Icon: Gamepad2,
      active: pathname === "/favorites",
    },
    {
      label: "Classements & Fair-Play",
      href: "/leaderboard",
      Icon: Trophy,
      active: pathname.startsWith("/leaderboard"),
    },
    {
      label: "Paramètres",
      href: "/settings",
      Icon: Settings,
      active: pathname === "/settings" || pathname === "/profile/edit",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed left-0 top-16 bottom-0 w-72 bg-surface-container-lowest border-r border-surface-container-high/80 z-40 flex flex-col justify-between py-4 px-3 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.active;
            const Icon = item.Icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-display font-medium tracking-wide transition-all ${
                  isActive
                    ? "bg-primary-container/20 text-primary border border-primary/40 shadow-[0_0_12px_rgba(78,222,163,0.15)]"
                    : "text-on-surface-variant hover:text-white hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-primary" : "text-on-surface-variant"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-on-primary">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Bouton Déconnexion dans la Sidebar */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-display font-medium tracking-wide text-error/80 hover:text-error hover:bg-error/10 transition-colors mt-2 border border-transparent hover:border-error/20 cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-error" />
            <span>Déconnexion</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
