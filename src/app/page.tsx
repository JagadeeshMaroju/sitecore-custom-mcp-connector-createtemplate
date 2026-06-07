export default function Home() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 720,
        margin: "3rem auto",
        padding: "0 1.5rem",
        lineHeight: 1.6,
      }}
    >
      <h1>Sitecore XM Cloud MCP Server</h1>
      <p>
        Next.js server that obtains an XM Cloud bearer token and creates data
        templates via the Authoring and Management GraphQL API.
      </p>

      <h2>Auth flow</h2>
      <ol>
        <li>
          POST to <code>https://auth.sitecorecloud.io/oauth/token</code> with{" "}
          <code>client_credentials</code>, Automation Client ID/secret, and{" "}
          <code>audience=https://api.sitecorecloud.io</code>
        </li>
        <li>Cache the <code>access_token</code> until expiry</li>
        <li>
          Call Authoring GraphQL with{" "}
          <code>Authorization: Bearer {"{access_token}"}</code>
        </li>
      </ol>

      <h2>REST endpoints</h2>
      <pre
        style={{
          background: "#f4f4f5",
          padding: "1rem",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {`GET  http://localhost:3000/api/sitecore/token
POST http://localhost:3000/api/sitecore/templates
     Body: { "templateName": "...", "parentPath": "/sitecore/templates/..." }`}
      </pre>

      <h2>MCP endpoint</h2>
      <pre
        style={{
          background: "#f4f4f5",
          padding: "1rem",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {`http://localhost:3000/api/mcp`}
      </pre>

      <h2>Configure Cursor</h2>
      <pre
        style={{
          background: "#f4f4f5",
          padding: "1rem",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {JSON.stringify(
          {
            mcpServers: {
              sitecore: {
                url: "http://localhost:3000/api/mcp",
              },
            },
          },
          null,
          2
        )}
      </pre>

      <p>
        Copy <code>.env.example</code> to <code>.env.local</code> and set your
        Automation Client credentials from XM Cloud Deploy.
      </p>
    </main>
  );
}
