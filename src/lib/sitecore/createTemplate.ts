import { executeAuthoringGraphQL } from "./graphql";

const GUID_REGEX =
  /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/;

export interface TemplateFieldInput {
  name: string;
  type: string;
}

export interface TemplateSectionInput {
  name: string;
  fields?: TemplateFieldInput[];
}

export interface CreateTemplateInput {
  templateName: string;
  parentPath: string;
  sections?: TemplateSectionInput[];
}

export interface CreateTemplateResult {
  success: boolean;
  template?: {
    id: string;
    name: string;
    fields?: Array<{ name: string; type: string }>;
  };
  error?: string;
}

function normalizeGuid(value: string): string {
  const trimmed = value.trim().replace(/^\{|\}$/g, "");
  return `{${trimmed.toUpperCase()}}`;
}

function escapeGraphqlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function resolveParentId(parentPath: string): Promise<string> {
  const trimmed = parentPath.trim();

  if (GUID_REGEX.test(trimmed)) {
    return normalizeGuid(trimmed);
  }

  const data = await executeAuthoringGraphQL<{
    item: { itemId: string } | null;
  }>(
    `query ResolveParent($path: String!) {
      item(where: { database: "master", path: $path }) {
        itemId
      }
    }`,
    { path: trimmed }
  );

  if (!data.item?.itemId) {
    throw new Error(`Parent item not found at path: ${trimmed}`);
  }

  return normalizeGuid(data.item.itemId);
}

function buildCreateItemTemplateMutation(
  templateName: string,
  parentId: string,
  sections?: TemplateSectionInput[]
): string {
  const lines = [
    `name: "${escapeGraphqlString(templateName)}"`,
    `parent: "${parentId}"`,
  ];

  if (sections?.length) {
    const section = sections[0];
    const fieldLines = (section.fields ?? []).map(
      (field) =>
        `{ name: "${escapeGraphqlString(field.name.trim())}", type: "${escapeGraphqlString(field.type.trim())}" }`
    );

    lines.push("sections: {");
    lines.push(`  name: "${escapeGraphqlString(section.name.trim())}"`);
    if (fieldLines.length) {
      lines.push("  fields: [");
      fieldLines.forEach((fieldLine) => lines.push(`    ${fieldLine}`));
      lines.push("  ]");
    }
    lines.push("}");
  }

  const inputBlock = lines.map((line) => `      ${line}`).join("\n");

  return `mutation {
  createItemTemplate(
    input: {
${inputBlock}
    }
  ) {
    itemTemplate {
      templateId
      name
      ownFields {
        nodes {
          name
          type
        }
      }
    }
  }
}`;
}

export async function createSitecoreTemplate(
  input: CreateTemplateInput
): Promise<CreateTemplateResult> {
  const templateName = input.templateName.trim();
  const parentPath = input.parentPath.trim();

  if (!templateName) {
    return { success: false, error: "templateName is required" };
  }
  if (!parentPath) {
    return { success: false, error: "parentPath is required" };
  }

  try {
    const parentId = await resolveParentId(parentPath);
    const mutation = buildCreateItemTemplateMutation(
      templateName,
      parentId,
      input.sections
    );

    const data = await executeAuthoringGraphQL<{
      createItemTemplate: {
        itemTemplate: {
          templateId: string;
          name: string;
          ownFields: {
            nodes: Array<{ name: string; type: string }>;
          } | null;
        } | null;
      };
    }>(mutation);

    const template = data.createItemTemplate?.itemTemplate;
    if (!template) {
      return {
        success: false,
        error: "createItemTemplate returned no template",
      };
    }

    return {
      success: true,
      template: {
        id: template.templateId,
        name: template.name,
        fields: template.ownFields?.nodes,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
