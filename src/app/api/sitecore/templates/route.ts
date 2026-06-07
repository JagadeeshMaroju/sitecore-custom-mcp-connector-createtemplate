import {
  createSitecoreTemplate,
  type TemplateSectionInput,
} from "@/lib/sitecore/createTemplate";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const { templateName, parentPath, sections } = body as {
    templateName?: string;
    parentPath?: string;
    sections?: TemplateSectionInput[];
  };

  if (!templateName || !parentPath) {
    return Response.json(
      {
        success: false,
        error: "templateName and parentPath are required",
      },
      { status: 400 }
    );
  }

  const result = await createSitecoreTemplate({
    templateName,
    parentPath,
    sections,
  });
  const status = result.success ? 200 : 500;

  return Response.json(result, { status });
}
