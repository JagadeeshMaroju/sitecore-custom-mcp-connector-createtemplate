import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createSitecoreTemplate } from "@/lib/sitecore/createTemplate";

const templateFieldSchema = z.object({
  name: z.string().min(1).describe("Field name"),
  type: z
    .string()
    .min(1)
    .describe('Field type (e.g. "Single-Line Text", "Rich Text")'),
});

const templateSectionSchema = z.object({
  //test1234
  name: z.string().min(1).describe("Section name"),
  fields: z.array(templateFieldSchema).optional().describe("Fields in the section"),
});

export const mcpHandler = createMcpHandler(
  (server) => {
    server.tool(
      "createTemplate",
      "Create a Sitecore data template under a parent folder using createItemTemplate. Provide templateName and parentPath (item path or GUID). Optionally include sections with fields.",
      {
        templateName: z.string().min(1).describe("Name of the new data template"),
        parentPath: z
          .string()
          .min(1)
          .describe(
            "Parent folder item path (e.g. /sitecore/templates/Feature) or parent item GUID"
          ),
        sections: z
          .array(templateSectionSchema)
          .optional()
          .describe("Optional template sections with fields"),
      },
      async ({ templateName, parentPath, sections }) => {
        const result = await createSitecoreTemplate({
          templateName,
          parentPath,
          sections,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    );
  },
  {},
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === "development",
  }
);
