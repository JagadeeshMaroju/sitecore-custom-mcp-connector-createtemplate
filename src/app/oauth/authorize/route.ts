export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const redirectUri = url.searchParams.get("redirect_uri");
  const state = url.searchParams.get("state");
  const codeChallenge = url.searchParams.get("code_challenge");
  const codeChallengeMethod = url.searchParams.get("code_challenge_method") ?? "S256";

  if (!redirectUri || !state || !codeChallenge) {
    return Response.json(
      { error: "Missing redirect_uri, state, or code_challenge" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.MCP_BASE_URL!;
  const auth0Domain = process.env.AUTH0_DOMAIN!;
  const clientId = process.env.AUTH0_WEB_CLIENT_ID!;

  const callbackUrl = `${baseUrl}/oauth/callback`;

  const auth0Authorize = new URL(`https://${auth0Domain}/authorize`);

  auth0Authorize.searchParams.set("response_type", "code");
  auth0Authorize.searchParams.set("client_id", clientId);
  auth0Authorize.searchParams.set("redirect_uri", callbackUrl);
  auth0Authorize.searchParams.set("scope", "openid profile email offline_access");
  auth0Authorize.searchParams.set("audience", process.env.AUTH0_AUDIENCE!);

  auth0Authorize.searchParams.set(
    "state",
    Buffer.from(
      JSON.stringify({
        sitecoreRedirectUri: redirectUri,
        sitecoreState: state,
        sitecoreCodeChallenge: codeChallenge,
        sitecoreCodeChallengeMethod: codeChallengeMethod,
      })
    ).toString("base64url")
  );

  return Response.redirect(auth0Authorize.toString());
}