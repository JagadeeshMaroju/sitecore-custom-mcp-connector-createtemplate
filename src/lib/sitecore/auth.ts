import { getSitecoreConfig } from "./config";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export function clearSitecoreTokenCache(): void {
  tokenCache = null;
}

export interface SitecoreAccessTokenInfo {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Obtains an XM Cloud bearer token via client_credentials + audience.
 * https://konabos.com/blog/how-to-get-started-with-the-sitecore-xm-cloud-management-api
 */
export async function getSitecoreAccessToken(): Promise<string> {
  const info = await fetchSitecoreAccessToken();
  return info.accessToken;
}

export async function fetchSitecoreAccessToken(): Promise<SitecoreAccessTokenInfo> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return {
      accessToken: tokenCache.accessToken,
      expiresIn: Math.max(0, Math.floor((tokenCache.expiresAt - Date.now()) / 1000)),
      tokenType: "Bearer",
    };
  }

  const config = getSitecoreConfig();

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    audience: config.audience,
  });

  const response = await fetch(config.authEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Sitecore authentication failed (${response.status}): ${text}`
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in?: number;
    token_type?: string;
  };

  const expiresIn = data.expires_in ?? 3600;
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return {
    accessToken: data.access_token,
    expiresIn,
    tokenType: data.token_type ?? "Bearer",
  };
}
