import {
  clearSitecoreTokenCache,
  getSitecoreAccessToken,
} from "./auth";
import { getSitecoreConfig } from "./config";

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

async function postAuthoringGraphQL<T>(
  query: string,
  variables: Record<string, unknown> | undefined,
  accessToken: string
): Promise<{ ok: boolean; status: number; result: GraphQLResponse<T> | string }> {
  const { authoringEndpoint } = getSitecoreConfig();

  const response = await fetch(authoringEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(
      variables ? { query, variables } : { query }
    ),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      result: await response.text(),
    };
  }

  return {
    ok: true,
    status: response.status,
    result: (await response.json()) as GraphQLResponse<T>,
  };
}

export async function executeAuthoringGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  let accessToken = await getSitecoreAccessToken();
  let response = await postAuthoringGraphQL<T>(query, variables, accessToken);

  if (!response.ok && response.status === 401) {
    clearSitecoreTokenCache();
    accessToken = await getSitecoreAccessToken();
    response = await postAuthoringGraphQL<T>(query, variables, accessToken);
  }

  if (!response.ok) {
    throw new Error(
      `Sitecore GraphQL request failed (${response.status}): ${response.result}`
    );
  }

  const result = response.result as GraphQLResponse<T>;

  if (result.errors?.length) {
    const messages = result.errors.map((e) => e.message).join("; ");
    throw new Error(`Sitecore GraphQL errors: ${messages}`);
  }

  if (!result.data) {
    throw new Error("Sitecore GraphQL returned no data");
  }

  return result.data;
}
