import { fetchSitecoreAccessToken } from "@/lib/sitecore/auth";
import { getSitecoreConfig } from "@/lib/sitecore/config";

export async function GET() {
  try {
    const config = getSitecoreConfig();
    const token = await fetchSitecoreAccessToken();

    return Response.json({
      success: true,
      authEndpoint: config.authEndpoint,
      authoringEndpoint: config.authoringEndpoint,
      audience: config.audience,
      tokenType: token.tokenType,
      expiresIn: token.expiresIn,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
