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
    last_name: z.string().optional(),
    workspaces: z.array(z.object({
      id: z.string().describe('Workspace Slug'),
      role: z.enum(['admin', 'member', 'manager'])
    })),
    workspace_api_key_details: z.object({
      name: z.string().optional(),
      expiry: z.string().optional(),
      metadata: z.record(z.string()).optional(),
      scopes: z.array(z.string())
    }).optional()
  },
  async (params) => {
    try {
      const result = await portkeyService.inviteUser(params);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            message: `Successfully invited ${params.email} as ${params.role}`,
            invite_id: result.id,
            invite_link: result.invite_link
          }, null, 2)
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

// Add get user grouped data tool
server.tool(
  "get_user_stats",
  "Get analytics data grouped by users within a time range",
  {
    time_of_generation_min: z.string().describe("Start time in ISO8601 format (e.g. 2024-01-01T00:00:00Z)"),
    time_of_generation_max: z.string().describe("End time in ISO8601 format (e.g. 2024-02-01T00:00:00Z)"),
    total_units_min: z.number().positive().optional(),
    total_units_max: z.number().positive().optional(),
    cost_min: z.number().positive().optional(),
    cost_max: z.number().positive().optional(),
    status_code: z.string().optional(),
    virtual_keys: z.string().optional(),
    page_size: z.number().positive().optional()
  },
  async (params) => {
    try {
      const stats = await portkeyService.getUserGroupedData(params);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(stats, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching user statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);