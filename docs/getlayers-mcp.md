# GetLayers MCP for Claude

[GetLayers](https://getlayers.ai) is a design-led web builder that exposes an
MCP (Model Context Protocol) server. Once connected, Claude can pull GetLayers
templates, 3D scenes, video backgrounds, and composition systems into this
project's frontend code.

This repo ships a project-scoped MCP config (`.mcp.json`) so the server is
registered automatically for anyone who opens the project in Claude Code.

```json
{
  "mcpServers": {
    "getlayers": {
      "type": "http",
      "url": "https://mcp.getlayers.ai/mcp"
    }
  }
}
```

## Authenticating (OAuth)

The GetLayers server requires authentication before it will expose its tools.
It uses an interactive OAuth sign-in, which must be completed from a local
Claude Code or Claude Desktop session (a remote/web session cannot open the
browser handoff).

1. Open this project locally in **Claude Code**.
2. When prompted, **enable** the `getlayers` server detected from `.mcp.json`
   (or run `claude mcp list` to confirm it is registered).
3. Run `/mcp` inside Claude Code, select **getlayers**, and choose
   **Authenticate**. Complete the browser sign-in.
4. Back in Claude Code, `claude mcp get getlayers` should now report a
   connected status instead of `Needs authentication`.
5. Start a **new** session — MCP tools load at session startup, so the
   GetLayers tools appear in the next session, not the one you authenticated in.

## Registering manually (without `.mcp.json`)

User scope (available in all your projects):

```bash
claude mcp add --scope user --transport http getlayers https://mcp.getlayers.ai/mcp
```

## Other clients

- **Claude Desktop** — Settings → MCP Server Connections → Add MCP Server →
  Remote HTTP Endpoint → URL `https://mcp.getlayers.ai/mcp`, name `getlayers`.
- **Cursor / VS Code** — the same server block shown above.

## Skills

GetLayers skills are served by the MCP server itself and become available once
the connection is authenticated — there is nothing extra to install in this
repo for them.
