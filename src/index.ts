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

// List all users tool
server.tool(
  "list_all_users",
  "List all users in your Portkey organization, including their roles and account details",
  {},
  async () => {
    const users = await portkeyService.listUsers();
    return {
      content: [{ type: "text", text: JSON.stringify(users, null, 2) }]
    }
  }
);

// Invite user tool
server.tool(
  "invite_user",
  "Invite a new user to your Portkey organization with specific workspace access and API key permissions",
  {
    email: z.string().email().describe("Email address of the user to invite"),
    role: z.enum(['admin', 'member']).describe("Organization-level role: 'admin' for full access, 'member' for limited access"),
    first_name: z.string().optional().describe("User's first name"),
    last_name: z.string().optional().describe("User's last name"),
    workspaces: z.array(z.object({
      id: z.string().describe("Workspace ID/slug where the user will be granted access"),
      role: z.enum(['admin', 'member', 'manager']).describe("Workspace-level role: 'admin' for full access, 'manager' for workspace management, 'member' for basic access")
    })).describe("List of workspaces and corresponding roles to grant to the user"),
    workspace_api_key_details: z.object({
      name: z.string().optional().describe("Name of the API key to be created"),
      expiry: z.string().optional().describe("Expiration date for the API key (ISO8601 format)"),
      metadata: z.record(z.string()).optional().describe("Additional metadata key-value pairs for the API key"),
      scopes: z.array(z.string()).describe("List of permission scopes for the API key")
    }).optional().describe("Optional API key to be created for the user")
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

// User analytics tool
server.tool(
  "get_user_stats",
  "Retrieve detailed analytics data about user activity within a specified time range, including request counts and costs",
  {
    time_of_generation_min: z.string().describe("Start time for the analytics period (ISO8601 format, e.g., '2024-01-01T00:00:00Z')"),
    time_of_generation_max: z.string().describe("End time for the analytics period (ISO8601 format, e.g., '2024-02-01T00:00:00Z')"),
    total_units_min: z.number().positive().optional().describe("Minimum number of total tokens to filter by"),
    total_units_max: z.number().positive().optional().describe("Maximum number of total tokens to filter by"),
    cost_min: z.number().positive().optional().describe("Minimum cost in cents to filter by"),
    cost_max: z.number().positive().optional().describe("Maximum cost in cents to filter by"),
    status_code: z.string().optional().describe("Filter by specific HTTP status codes (comma-separated)"),
    virtual_keys: z.string().optional().describe("Filter by specific virtual key slugs (comma-separated)"),
    page_size: z.number().positive().optional().describe("Number of results per page (for pagination)")
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

// List workspaces tool
server.tool(
  "list_workspaces",
  "Retrieve all workspaces in your Portkey organization, including their configurations and metadata",
  {
    page_size: z.number().positive().optional().describe("Number of workspaces to return per page (default varies by endpoint)"),
    current_page: z.number().positive().optional().describe("Page number to retrieve when results are paginated")
  },
  async (params) => {
    try {
      const workspaces = await portkeyService.listWorkspaces(params);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(workspaces, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching workspaces: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);