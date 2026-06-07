export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();

  const grantType = formData.get("grant_type")?.toString();
  const code = formData.get("code")?.toString();

  if (grantType !== "authorization_code" || !code) {
    return Response.json(
      { error: "unsupported_grant_type" },
      { status: 400 }
    );
  }

  const auth0Domain = process.env.AUTH0_DOMAIN!;
  const clientId = process.env.AUTH0_WEB_CLIENT_ID!;
  const clientSecret = process.env.AUTH0_WEB_CLIENT_SECRET!;
  const audience = process.env.AUTH0_AUDIENCE!;
  const baseUrl = process.env.MCP_BASE_URL!;

  const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${baseUrl}/oauth/callback`,
      audience,
    }),
  });

  const tokenJson = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return Response.json(tokenJson, { status: tokenResponse.status });
  }

  return Response.json({
    access_token: tokenJson.access_token,
    id_token: tokenJson.id_token,
    refresh_token: tokenJson.refresh_token,
    token_type: "Bearer",
    expires_in: tokenJson.expires_in ?? 3600,
    scope: tokenJson.scope ?? "openid profile email",
  });
}