export interface SitecoreConfig {
  clientId: string;
  clientSecret: string;
  authEndpoint: string;
  authoringEndpoint: string;
  audience: string;
}

const XM_CLOUD_AUTH_ENDPOINT = "https://auth.sitecorecloud.io/oauth/token";
const XM_CLOUD_AUDIENCE = "https://api.sitecorecloud.io";

export function getSitecoreConfig(): SitecoreConfig {
  const clientId = process.env.SITECORE_CLIENT_ID;
  const clientSecret = process.env.SITECORE_CLIENT_SECRET;
  const authoringEndpoint = process.env.SITECORE_AUTHORING_ENDPOINT;

  const missing: string[] = [];
  if (!clientId) missing.push("SITECORE_CLIENT_ID");
  if (!clientSecret) missing.push("SITECORE_CLIENT_SECRET");
  if (!authoringEndpoint) missing.push("SITECORE_AUTHORING_ENDPOINT");

  if (missing.length > 0) {
    throw new Error(
      `Missing required Sitecore environment variables: ${missing.join(", ")}`
    );
  }

  return {
    clientId: clientId!,
    clientSecret: clientSecret!,
    authEndpoint: process.env.SITECORE_AUTH_ENDPOINT?.trim() || XM_CLOUD_AUTH_ENDPOINT,
    authoringEndpoint: authoringEndpoint!,
    audience: process.env.SITECORE_AUDIENCE?.trim() || XM_CLOUD_AUDIENCE,
  };
}
