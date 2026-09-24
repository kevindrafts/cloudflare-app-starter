import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Search,
  ArrowUpRight,
  FolderKanban,
  CircleCheck,
  Clock3,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectForm } from "@/components/ProjectForm";
export function Projects({ overview = false }: { overview?: boolean }) {
  const query = useQuery({ queryKey: ["projects"], queryFn: api.list });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const projects = query.data?.projects ?? [];
  const filtered = projects.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-5 mb-8">
        <div>
          <p className="eyebrow text-muted-foreground mb-3">
            {overview ? "A little progress, every day" : "From idea to done"}
          </p>
          <h1 className="page-heading">
            {overview ? "A good place to begin." : "Your projects."}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            {overview
              ? "Here’s what’s taking shape in your workspace."
              : "Keep your ideas organized and your next steps clear."}
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus />
          New project
        </Button>
      </div>
      {overview && (
        <>
          <section className="bg-primary text-primary-foreground rounded-2xl px-7 py-8 md:p-9 mb-7 flex items-center justify-between gap-7 overflow-hidden">
            <div>
              <p className="eyebrow opacity-65 mb-3">
                Built for the work ahead
              </p>
              <h2 className="text-2xl md:text-3xl tracking-tight font-medium">
                Big things start small.
              </h2>
              <p className="text-sm opacity-75 mt-3 max-w-md leading-relaxed">
                Capture an idea, give it a direction, and take the next step.
                Your next good thing starts here.
              </p>
              <Button
                onClick={() => setCreating(true)}
                className="mt-6 !bg-accent !text-accent-foreground"
              >
                Make your first move <ArrowUpRight />
              </Button>
            </div>
            <div
              aria-hidden="true"
              className="hidden lg:grid grid-cols-2 w-44 h-44 shrink-0 rotate-[-12deg]"
            >
              <div className="rounded-full bg-accent" />
              <div className="rounded-tr-full bg-art-light" />
              <div className="rounded-bl-full bg-art-muted" />
              <div className="rounded-full border-[22px] border-accent" />
            </div>
          </section>
          <section
            aria-label="Project statistics"
            className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10"
          >
            {[
              {
                label: "Total projects",
                count: projects.length,
                icon: FolderKanban,
              },
              {
                label: "In progress",
                count: projects.filter((p) => p.status === "active").length,
                icon: Activity,
              },
              {
                label: "Completed",
                count: projects.filter((p) => p.status === "done").length,
                icon: CircleCheck,
              },
              {
                label: "Planned",
                count: projects.filter((p) => p.status === "planned").length,
                icon: Clock3,
              },
            ].map(({ label, count, icon: Icon }) => (
              <div key={label} className="bg-card rounded-xl border p-5">
                <div className="flex justify-between gap-2 items-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <p className="text-3xl tracking-tight mt-4">
                  {query.isPending || query.isError ? "—" : count}
                </p>
              </div>
            ))}
          </section>
        </>
      )}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-5">
        <h2 className="text-lg tracking-tight">
          {overview ? "Latest projects" : "All projects"}{" "}
          <span className="text-xs rounded-full bg-muted px-2 py-1 ml-2">
            {projects.length}
          </span>
        </h2>
        {overview ? (
          <Link
            to="/projects"
            className="text-xs flex gap-2 items-center underline"
          >
            View all projects <ArrowUpRight className="size-3" />
          </Link>
        ) : (
          <div className="flex gap-3 flex-wrap w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                aria-label="Search projects"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="pl-9"
              />
            </div>
            <select
              aria-label="Filter by status"
              className="control !w-auto text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="planned">Planned</option>
              <option value="active">In progress</option>
              <option value="done">Completed</option>
            </select>
          </div>
        )}
      </div>
      {query.isPending ? (
        <div
          role="status"
          aria-label="Loading projects"
          className="project-grid"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse border rounded-xl bg-card h-60 p-6"
            >
              <div className="size-10 bg-muted rounded-lg" />
              <div className="h-4 bg-muted rounded mt-6 w-2/3" />
              <div className="h-3 bg-muted rounded mt-4" />
              <p className="sr-only">Loading projects…</p>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div role="alert" className="border rounded-xl p-8 bg-card">
          <h3 className="font-medium">We couldn’t load your projects.</h3>
          <p className="text-sm text-muted-foreground my-3">
            {query.error.message}
          </p>
          <Button variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed rounded-xl text-center p-12 bg-card">
          <FolderKanban className="size-8 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg">
            {projects.length
              ? "No matching projects"
              : "A fresh page for your next idea."}
          </h3>
          <p className="text-sm text-muted-foreground my-3">
            {projects.length
              ? "Try another search or status filter."
              : "Create a project and give it a little direction."}
          </p>
          {projects.length ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button onClick={() => setCreating(true)}>
              <Plus />
              Create a project
            </Button>
          )}
        </div>
      ) : (
        <div className="project-grid">
          {(overview ? filtered.slice(0, 6) : filtered).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
      {creating && <ProjectForm open={creating} onOpenChange={setCreating} />}
    </>
  );
}

export function Overview() {
  return <Projects overview />;
}
