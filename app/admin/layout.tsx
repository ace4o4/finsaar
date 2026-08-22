"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  PlusCircle,
  ExternalLink,
  LogOut,
  Database,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Calendar,
  Briefcase,
  LayoutDashboard,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { checkAdminSession, logoutAdmin } from "@/app/actions/admin-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // If on login page, don't show admin sidebar
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      if (isLoginPage) {
        if (isMounted) setIsAuthenticated(true);
        return;
      }

      // 1. Check local storage flag
      const localAuth = typeof window !== "undefined" && localStorage.getItem("finsaar_admin_auth") === "true";
      
      // 2. Check server-side HTTP-only session cookie
      const sessionCheck = await checkAdminSession();

      // 3. Check Supabase session if configured
      let hasSupabaseSession = false;
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          hasSupabaseSession = true;
          if (isMounted) setUserEmail(session.user.email || "Admin");
        }
      }

      if (localAuth || sessionCheck.isAuthenticated || hasSupabaseSession) {
        if (isMounted) setIsAuthenticated(true);
      } else {
        if (isMounted) {
          setIsAuthenticated(false);
          router.replace("/admin/login");
        }
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("finsaar_admin_auth");
    }
    await logoutAdmin();
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    router.replace("/admin/login");
  };

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#FAFAF8]">{children}</div>;
  }

  // If verifying authentication, show security shield loader
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#14213A] to-[#1e3256] flex items-center justify-center text-white mb-4 shadow-xl shadow-[#14213A]/10 animate-pulse">
          <Lock size={22} className="text-[#B5723B]" />
        </div>
        <h2 className="font-heading font-bold text-lg text-[#14213A]">
          Verifying Authorization
        </h2>
        <p className="text-xs text-[#7A7F8C] mt-1">
          Securing administrative session...
        </p>
      </div>
    );
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Strategy Leads",
      href: "/admin/leads",
      icon: Inbox,
      active: pathname.startsWith("/admin/leads"),
    },
    {
      label: "All Blog Posts",
      href: "/admin/blog",
      icon: FileText,
      active: pathname === "/admin/blog",
    },
    {
      label: "Create New Post",
      href: "/admin/blog/new",
      icon: PlusCircle,
      active: pathname === "/admin/blog/new",
    },
    {
      label: "Compliance Calendar",
      href: "/admin/compliance",
      icon: Calendar,
      active: pathname.startsWith("/admin/compliance"),
    },
    {
      label: "Case Studies",
      href: "/admin/case-studies",
      icon: Briefcase,
      active: pathname.startsWith("/admin/case-studies"),
    },
  ];

  return (
    <div className="h-screen bg-[#FAFAF8] flex flex-col md:flex-row font-body text-[#14213A] overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-[#E7E4DC] px-4 py-3 flex items-center justify-between shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/imp/logo/d.png" alt="Finsaar Studio Logo" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="font-heading font-bold text-[#14213A] text-lg">
            Finsaar <span className="text-[#B5723B] text-xs font-medium uppercase tracking-wider ml-1">Studio</span>
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-[#14213A]/70 hover:text-[#14213A]"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } flex flex-col ${
          isMinimized ? "md:w-20" : "md:w-64"
        } bg-white border-r border-[#E7E4DC] p-4 shrink-0 fixed md:relative top-[60px] md:top-0 h-[calc(100vh-60px)] md:h-screen z-40 transition-all duration-500 ease-in-out w-64`}
      >
        {/* Toggle Button for Desktop */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-[#E7E4DC] rounded-full items-center justify-center text-[#7A7F8C] hover:text-[#14213A] hover:shadow-sm transition-all duration-300 z-50"
        >
          {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <Link href="/admin" className={`hidden md:flex items-center ${isMinimized ? "justify-center" : "gap-3"} mb-8 h-10 group`}>
          <div className="w-9 h-9 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image src="/imp/logo/d.png" alt="Finsaar Studio Logo" width={36} height={36} className="w-full h-full object-contain" />
          </div>
          {!isMinimized && (
            <div className="overflow-hidden whitespace-nowrap opacity-100 transition-opacity duration-500 ease-in-out">
              <h1 className="font-heading font-bold text-[#14213A] text-base leading-tight group-hover:text-[#B5723B] transition-colors">
                Finsaar Studio
              </h1>
              <p className="text-[11px] text-[#7A7F8C] uppercase tracking-wider font-semibold">
                Content Manager
              </p>
            </div>
          )}
        </Link>

        {/* Status Indicator */}
        {!isMinimized && (
          <div className="mb-6 p-3 rounded-xl bg-[#FAFAF8] border border-[#E7E4DC] whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out">
            <div className="flex items-center gap-2 mb-1">
              <Database size={14} className={isSupabaseConfigured ? "text-[#0E9F6E]" : "text-[#B5723B]"} />
              <span className="text-xs font-semibold text-[#14213A]">
                {isSupabaseConfigured ? "Supabase Connected" : "Local Mode"}
              </span>
            </div>
            <p className="text-[11px] text-[#7A7F8C] leading-tight">
              {isSupabaseConfigured
                ? "Live cloud database active"
                : "Set .env.local keys to sync"}
            </p>
          </div>
        )}

        {isMinimized && (
          <div className="mb-6 flex justify-center">
            <Database size={18} className={isSupabaseConfigured ? "text-[#0E9F6E]" : "text-[#B5723B]"} />
          </div>
        )}

        {/* Navigation Items */}
        <div className="space-y-1 mb-8">
          {!isMinimized && (
            <p className="text-[11px] font-semibold text-[#7A7F8C] uppercase tracking-wider px-3 mb-2 whitespace-nowrap">
              Admin Navigation
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={isMinimized ? item.label : undefined}
                className={`flex items-center ${
                  isMinimized ? "justify-center px-0" : "gap-3 px-3.5"
                } py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap overflow-hidden ${
                  item.active
                    ? "bg-[#14213A] text-white shadow-sm"
                    : "text-[#3a3f4d] hover:bg-[#F5F3EE] hover:text-[#14213A]"
                }`}
              >
                <Icon size={isMinimized ? 20 : 18} className={`shrink-0 ${item.active ? (isMinimized ? "text-white" : "text-[#B5723B]") : "opacity-70"}`} />
                {!isMinimized && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-6 border-t border-[#E7E4DC] space-y-2">
          <Link
            href="/blog"
            target="_blank"
            title={isMinimized ? "View Live Blog" : undefined}
            className={`flex items-center ${isMinimized ? "justify-center px-0" : "justify-between px-3.5"} py-2 rounded-xl text-xs font-medium text-[#7A7F8C] hover:text-[#14213A] hover:bg-[#F5F3EE] transition-colors`}
          >
            {isMinimized ? (
              <ExternalLink size={18} />
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <ExternalLink size={14} /> View Live Blog
                </span>
                <span className="text-[10px] bg-[#E7E4DC] px-1.5 py-0.5 rounded text-[#14213A]">
                  ↗
                </span>
              </>
            )}
          </Link>

          <button
            onClick={handleLogout}
            title={isMinimized ? "Sign Out" : undefined}
            className={`w-full flex items-center ${isMinimized ? "justify-center px-0" : "gap-2 px-3.5"} py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors`}
          >
            <LogOut size={isMinimized ? 18 : 14} className="shrink-0" />
            {!isMinimized && (
              <span>{userEmail ? `Sign Out (${userEmail.split("@")[0]})` : "Sign Out"}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-[#FAFAF8] h-[calc(100vh-60px)] md:h-screen">
        <div className="w-full max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
