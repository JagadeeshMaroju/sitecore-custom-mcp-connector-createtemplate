export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { mcpHandler } from "./mcpServer";
import { withMcpOAuthChallenge } from "@/lib/sitecore/withMcpOAuthChallenge";

const withAuth = withMcpOAuthChallenge(mcpHandler);

export { withAuth as GET, withAuth as POST, mcpHandler as DELETE };
