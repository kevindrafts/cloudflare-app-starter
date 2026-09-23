import { z } from "zod";
export const statusSchema = z.enum(["planned", "active", "done"]);
export const projectInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Give your project a name.")
      .max(80, "Keep the name to 80 characters."),
    description: z
      .string()
      .trim()
      .max(500, "Keep the description to 500 characters.")
      .default(""),
    status: statusSchema.default("planned"),
  })
  .strict();
export const projectIdSchema = z.string().uuid();
export const projectSchema = projectInputSchema.extend({
  id: projectIdSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const projectsResponseSchema = z.object({
  projects: z.array(projectSchema),
});
export const projectResponseSchema = z.object({ project: projectSchema });
export const errorResponseSchema = z.object({
  error: z.string(),
  issues: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional(),
});
export type Project = z.infer<typeof projectSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ProjectStatus = z.infer<typeof statusSchema>;
