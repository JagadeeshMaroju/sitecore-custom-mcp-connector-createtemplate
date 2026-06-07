import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitecore MCP Server",
  description: "MCP server for Sitecore Authoring GraphQL operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
