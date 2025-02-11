import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PortkeyService } from "./services/portkey.service.js";
import { z } from "zod";

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

// Add users list tool
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

// Add invite user tool
server.tool(
  "invite_user",
  "Invite a new user to Portkey",
  {
    email: z.string().email(),
    role: z.enum(['admin', 'member']),
    first_name: z.string().optional(),
    last_name: z.string().optional()
  },
  async (params) => {
    try {
      const result = await portkeyService.inviteUser(params);
      return {
        content: [{ 
          type: "text", 
          text: result.success 
            ? `Successfully invited ${params.email} as ${params.role}`
            : `Failed to invite user: ${result.message}`
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error inviting user: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);