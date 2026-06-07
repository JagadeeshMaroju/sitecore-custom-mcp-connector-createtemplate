import { getResourceMetadataUrl } from "@/lib/sitecore/oauthMetadata";

export function withMcpOAuthChallenge(
  handler: (request: Request) => Response | Promise<Response>
) {
  return async (request: Request) => {
    const auth = request.headers.get("authorization");

    if (!auth?.startsWith("Bearer ")) {
      const resourceMetadataUrl = getResourceMetadataUrl("/api/mcp");

      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Bearer resource_metadata="${resourceMetadataUrl}"`,
        },
      });
    }

    return handler(request);
  };
}
