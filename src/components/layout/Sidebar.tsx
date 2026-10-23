"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Explorer les Salons",
      href: "/",
      icon: "dashboard",
      active: pathname === "/" || (pathname.startsWith("/tickets") && !pathname.includes("my-tickets")),
    },
    {
      label: "Mes Tickets",
      href: "/my-tickets",
      icon: "confirmation_number",
      badge: "2",
      active: pathname === "/my-tickets",
    },
    {
      label: "Messagerie & Voc",
      href: "/messages",
      icon: "chat",
      badge: "3",
      active: pathname === "/messages",
    },
    {
      label: "Jeux Favoris",
      href: "/favorites",
      icon: "sports_esports",
      active: pathname === "/favorites",
    },
    {
      label: "Classements & Fair-Play",
      href: "/leaderboard",
      icon: "military_tech",
      active: pathname === "/leaderboard",
    },
    {
      label: "Paramètres",
      href: "/settings",
      icon: "tune",
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
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isActive ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {item.icon}
                  </span>
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
        </nav>

        {/* Connected Platforms Widget */}
        <div className="flex flex-col gap-3 p-3.5 bg-surface-container-low/70 rounded-xl border border-surface-container-high/60">
          <span className="text-[10px] font-display font-bold tracking-wider text-on-surface-variant/70 uppercase">
            Plateformes Connectées
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-medium text-white">Steam</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Lié</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-medium text-white">Xbox Live</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Lié</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="font-medium text-white">Discord</span>
              </div>
              <span className="text-[11px] text-secondary font-medium">Vocal</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-on-surface-variant">Europe (Frankfurt)</span>
              </div>
              <span className="text-[11px] font-mono text-primary font-bold">18ms</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
