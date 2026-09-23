import { z } from "zod";
import {
  errorResponseSchema,
  projectResponseSchema,
  projectsResponseSchema,
  type ProjectInput,
} from "../../shared/contracts";
async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const error = errorResponseSchema.safeParse(
      await response.json().catch(() => null),
    );
    throw new Error(
      error.success
        ? error.data.error
        : "Could not reach the server. Try again.",
    );
  }
  if (response.status === 204) return schema.parse(undefined);
  return schema.parse(await response.json());
}
export const api = {
  list: () => request("/projects", projectsResponseSchema),
  create: (data: ProjectInput) =>
    request("/projects", projectResponseSchema, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: ProjectInput) =>
    request(`/projects/${id}`, projectResponseSchema, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request(`/projects/${id}`, z.undefined(), { method: "DELETE" }),
};
