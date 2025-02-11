import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PortkeyService } from "./services/portkey.service.js";

// Create service instance
const portkeyService = new PortkeyService();

// Create MCP server
const server = new McpServer({
  name: "portkey-server",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {}
  }
});


server.tool(
    "list_all_users",
    "List all portkey users",
    {},
    async () => {
        const users = await portkeyService.listUsers();
        return {
            content: [{ type: "text", text: JSON.stringify(users, null, 2) }]
        }
    }
  );

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);