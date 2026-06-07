export function getOAuthConfig() {
  const resource = process.env.AUTH0_AUDIENCE;
  const auth0Domain = process.env.AUTH0_DOMAIN;

  if (!resource || !auth0Domain) {
    throw new Error(
      "Missing required OAuth environment variables: AUTH0_AUDIENCE, AUTH0_DOMAIN"
    );
  }

  return {
    resource,
    auth0Domain,
    authorizationServer: `https://${auth0Domain}`,
  };
}

export function getProtectedResourceMetadata(resourceOverride?: string) {
  const { resource, authorizationServer } = getOAuthConfig();

  return {
    resource: resourceOverride ?? resource,
    authorization_servers: [
  `${process.env.MCP_BASE_URL}/.well-known/oauth-authorization-server`,
],
    bearer_methods_supported: ["header"],
    scopes_supported: ["openid", "profile", "email"],
    resource_name: "Sitecore MCP Server",
    resource_documentation: `${resource}/`,
  };
}

export function getResourceMetadataUrl(path?: string): string {
  const { resource } = getOAuthConfig();
  if (path) {
    return `${resource}/.well-known/oauth-protected-resource${path}`;
  }

  return `${resource}/.well-known/oauth-protected-resource`;
}
