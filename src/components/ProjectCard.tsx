import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Folder } from "lucide-react";
import { api } from "@/lib/api";
import type { Project } from "../../shared/contracts";
import { ProjectForm } from "./ProjectForm";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
const statuses = {
  planned: { label: "Planned", style: "bg-muted text-muted-foreground" },
  active: { label: "In progress", style: "bg-[#e5eedc] text-[#355c28]" },
  done: { label: "Completed", style: "bg-[#e5eee9] text-[#245d49]" },
};
export function ProjectCard({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const client = useQueryClient();
  const remove = useMutation({
    mutationFn: () => api.remove(project.id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["projects"] }),
  });
  const status = statuses[project.status];
  return (
    <article
      className="project-card bg-card border rounded-xl p-6 flex flex-col"
      aria-label={project.name}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
          <Folder className="size-5" />
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${status.style}`}
        >
          {status.label}
        </span>
      </div>
      <h3 className="text-lg tracking-tight font-medium break-words">
        {project.name}
      </h3>
      <p className="project-description text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-3 min-h-[4rem] break-words">
        {project.description ||
          "A fresh start. Add a few details as the idea takes shape."}
      </p>
      <div className="flex items-center justify-between border-t pt-4 mt-6 gap-2">
        <span className="text-[10px] text-muted-foreground">
          Updated{" "}
          {new Date(project.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${project.name}`}
            onClick={() => setEditing(true)}
          >
            <Pencil className="!size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${project.name}`}
            onClick={() => setDeleting(true)}
          >
            <Trash2 className="!size-3.5" />
          </Button>
        </div>
      </div>
      {editing && (
        <ProjectForm
          key={project.updatedAt}
          project={project}
          open={editing}
          onOpenChange={setEditing}
        />
      )}
      <Dialog
        open={deleting}
        onOpenChange={(v) => {
          if (!remove.isPending) setDeleting(v);
        }}
      >
        <DialogContent>
          <DialogTitle className="text-xl font-semibold">
            Delete project?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-3">
            “{project.name}” will be permanently removed from this public demo.
          </DialogDescription>
          {remove.error && (
            <p role="alert" className="text-destructive mt-4">
              {remove.error.message}
            </p>
          )}
          <div className="flex gap-3 justify-end mt-7">
            <Button
              variant="outline"
              disabled={remove.isPending}
              onClick={() => setDeleting(false)}
            >
              Keep project
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
            >
              {remove.isPending ? "Deleting…" : "Delete project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
