export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClientRegistrationRequest = {
  client_name?: string;
  redirect_uris?: string[];
  grant_types?: string[];
  response_types?: string[];
  token_endpoint_auth_method?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ClientRegistrationRequest;

  return Response.json({
    client_id: "sitecore-agentic-studio",
    client_secret: "sitecore-agentic-studio-secret",
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_name: body.client_name ?? "Sitecore Agentic Studio",
    redirect_uris: body.redirect_uris ?? [],
    grant_types: body.grant_types ?? ["authorization_code"],
    response_types: body.response_types ?? ["code"],
    token_endpoint_auth_method:
      body.token_endpoint_auth_method ?? "client_secret_post",
  });
}