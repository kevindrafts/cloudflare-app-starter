import { Link, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  ArrowUpRight,
  Sprout,
  Menu,
  X,
  Info,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;
export function Shell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-card focus:p-3"
      >
        Skip to content
      </a>
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <Link to="/" className="text-xl font-bold tracking-tight">
          ✳ forma
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      <aside
        className={`${open ? "flex" : "hidden"} md:flex md:fixed md:inset-y-0 md:w-60 flex-col bg-card border-r p-5 z-30`}
      >
        <Link
          to="/"
          className="hidden md:flex items-center gap-2 text-2xl font-bold tracking-tight px-3 pt-3 pb-9"
        >
          <Sprout className="size-7" />
          forma<span className="text-xs self-start mt-1">®</span>
        </Link>
        <div className="rounded-xl border p-3 flex items-center gap-3 mb-7">
          <span className="size-9 bg-muted rounded-lg flex items-center justify-center text-sm font-bold">
            F
          </span>
          <div>
            <p className="text-sm font-semibold">Forma workspace</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Starter edition
            </p>
          </div>
          <span className="ml-auto size-1.5 rounded-full bg-primary" />
        </div>
        <p className="eyebrow text-muted-foreground px-3 mb-3">Workspace</p>
        <nav aria-label="Main navigation" className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground"
              activeProps={{
                className: "!bg-muted !text-foreground font-semibold",
                "aria-current": "page",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-12">
          <div className="rounded-xl bg-muted p-4">
            <Sprout className="size-5 mb-3" />
            <p className="text-sm font-medium">Room for your next idea.</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              A small foundation.
              <br />A world of possibilities.
            </p>
            <a
              href="https://github.com/kevindrafts/cloudflare-app-starter"
              className="inline-flex gap-2 items-center text-xs font-semibold mt-4 underline"
            >
              Explore the starter <ArrowUpRight className="size-3" />
            </a>
          </div>
          <div className="mt-5 flex items-center gap-3 px-1">
            <span className="bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center text-xs">
              D
            </span>
            <div className="text-xs">
              <p className="font-medium">Demo workspace</p>
              <p className="text-muted-foreground mt-0.5">
                Public · No sign-in
              </p>
            </div>
          </div>
        </div>
      </aside>
      <div className="md:ml-60">
        <header className="border-b px-5 md:px-10 py-5 flex justify-between text-xs text-muted-foreground">
          <span>
            Workspace <span className="mx-3 opacity-40">/</span> Your next
            chapter
          </span>
          <span className="hidden sm:block">Make something useful.</span>
        </header>
        <div className="px-5 md:px-10 pt-5">
          <div className="flex gap-2 text-xs leading-relaxed rounded-lg border border-[#e7cbb8] bg-[#fff5e8] text-[#754321] px-3 py-2.5">
            <Info className="size-4 shrink-0 mt-0.5" />
            <p>
              <strong>Public demo.</strong> Anyone with access can view, edit,
              and delete these projects. Use sample data only.
            </p>
          </div>
        </div>
        <main id="main" className="px-5 md:px-10 py-9 max-w-[1440px] mx-auto">
          <Outlet />
        </main>
        <footer className="px-5 md:px-10 py-8 text-xs text-muted-foreground flex flex-wrap gap-3 justify-between">
          <span>Forma Workspace · Open source, open possibilities.</span>
          <span>Built on Cloudflare</span>
        </footer>
      </div>
    </div>
  );
}
