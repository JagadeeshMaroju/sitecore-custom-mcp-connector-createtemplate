export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const auth0Code = url.searchParams.get("code");
  const encodedState = url.searchParams.get("state");

  if (!auth0Code || !encodedState) {
    return Response.json(
      { error: "Missing code or state" },
      { status: 400 }
    );
  }

  const state = JSON.parse(
    Buffer.from(encodedState, "base64url").toString()
  );

  // Fix Sitecore localhost redirect issue
  const fixedRedirectUri = state.sitecoreRedirectUri.replace(
    "https://0.0.0.0:3000",
    "https://agentic-studio-use.sitecorecloud.io"
  );

  const redirect = new URL(fixedRedirectUri);

  // Send Auth0 code back to Sitecore
  redirect.searchParams.set("code", auth0Code);
  redirect.searchParams.set("state", state.sitecoreState);

  let finalRedirect = redirect.toString();

  // Extra safety replacement
  finalRedirect = finalRedirect.replace(
    "https://0.0.0.0:3000",
    "https://agentic-studio-use.sitecorecloud.io"
  );

  return Response.redirect(finalRedirect);
}