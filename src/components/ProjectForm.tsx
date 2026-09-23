import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  projectInputSchema,
  type Project,
  type ProjectStatus,
} from "../../shared/contracts";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
export function ProjectForm({
  project,
  open,
  onOpenChange,
}: {
  project?: Project;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "planned",
  );
  const [issues, setIssues] = useState<Record<string, string>>({});
  const mutation = useMutation({
    mutationFn: api.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
    },
  });
  const update = useMutation({
    mutationFn: (data: Parameters<typeof api.create>[0]) =>
      api.update(project!.id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
    },
  });
  const action = project ? update : mutation;
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = projectInputSchema.safeParse({ name, description, status });
    if (!parsed.success) {
      setIssues(
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path.join("."), i.message]),
        ),
      );
      return;
    }
    setIssues({});
    action.mutate(parsed.data);
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!action.isPending) onOpenChange(value);
      }}
    >
      <DialogContent>
        <DialogTitle className="text-xl font-semibold">
          {project ? "Edit project" : "A little start. A big possibility."}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mt-2 mb-6">
          {project
            ? "Keep the details moving with your work."
            : "Give your next idea a place to grow. Use sample data only."}
        </DialogDescription>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="field">
            <label htmlFor="project-name">Project name</label>
            <Input
              autoFocus
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website refresh"
              maxLength={80}
              aria-invalid={!!issues.name}
              aria-describedby={issues.name ? "name-error" : undefined}
            />
            {issues.name && (
              <p
                id="name-error"
                className="text-destructive text-xs"
                role="alert"
              >
                {issues.name}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="project-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <textarea
              id="project-description"
              className="control min-h-28 resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="What are you working toward?"
              aria-invalid={!!issues.description}
            />
            {issues.description && (
              <p role="alert" className="text-destructive text-xs">
                {issues.description}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="project-status">Status</label>
            <select
              id="project-status"
              className="control"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              <option value="planned">Planned</option>
              <option value="active">In progress</option>
              <option value="done">Completed</option>
            </select>
          </div>
          {action.error && (
            <p role="alert" className="text-sm text-destructive">
              {action.error.message}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={action.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={action.isPending}>
              {action.isPending
                ? "Saving…"
                : project
                  ? "Save changes"
                  : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
