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

// Get single workspace tool
server.tool(
  "get_workspace",
  "Retrieve detailed information about a specific workspace, including its configuration, metadata, and user access details",
  {
    workspace_id: z.string().describe(
      "The unique identifier of the workspace to retrieve. " +
      "This can be found in the workspace's URL or from the list_workspaces tool response"
    )
  },
  async (params) => {
    try {
      const workspace = await portkeyService.getWorkspace(params.workspace_id);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            description: workspace.description,
            created_at: workspace.created_at,
            last_updated_at: workspace.last_updated_at,
            defaults: workspace.defaults,
            users: workspace.users.map(user => ({
              id: user.id,
              name: `${user.first_name} ${user.last_name}`,
              organization_role: user.org_role,
              workspace_role: user.role,
              status: user.status,
              created_at: user.created_at,
              last_updated_at: user.last_updated_at
            }))
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching workspace details: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// List configurations tool
server.tool(
  "list_configs",
  "Retrieve all configurations in your Portkey organization, including their status and workspace associations",
  {},
  async () => {
    try {
      const configs = await portkeyService.listConfigs();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: configs.success,
            configurations: configs.data.map(config => ({
              id: config.id,
              name: config.name,
              slug: config.slug,
              workspace_id: config.workspace_id,
              status: config.status,
              is_default: config.is_default,
              created_at: config.created_at,
              last_updated_at: config.last_updated_at,
              owner_id: config.owner_id,
              updated_by: config.updated_by
            }))
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching configurations: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// List virtual keys tool
server.tool(
  "list_virtual_keys",
  "Retrieve all virtual keys in your Portkey organization, including their usage limits, rate limits, and status",
  {},
  async () => {
    try {
      const virtualKeys = await portkeyService.listVirtualKeys();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            total: virtualKeys.total,
            virtual_keys: virtualKeys.data.map(key => ({
              name: key.name,
              slug: key.slug,
              status: key.status,
              note: key.note,
              usage_limits: {
                credit_limit: key.usage_limits.credit_limit,
                alert_threshold: key.usage_limits.alert_threshold,
                periodic_reset: key.usage_limits.periodic_reset
              },
              rate_limits: key.rate_limits?.map(limit => ({
                type: limit.type,
                unit: limit.unit,
                value: limit.value
              })) ?? null,
              reset_usage: key.reset_usage,
              created_at: key.created_at,
              model_config: key.model_config
            }))
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching virtual keys: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Get cost analytics tool
server.tool(
  "get_cost_analytics",
  "Retrieve detailed cost analytics data over time, including total costs and averages per request",
  {
    time_of_generation_min: z.string().describe("Start time for the analytics period (ISO8601 format, e.g., '2024-01-01T00:00:00Z')"),
    time_of_generation_max: z.string().describe("End time for the analytics period (ISO8601 format, e.g., '2024-02-01T00:00:00Z')"),
    total_units_min: z.number().positive().optional().describe("Minimum number of total tokens to filter by"),
    total_units_max: z.number().positive().optional().describe("Maximum number of total tokens to filter by"),
    cost_min: z.number().positive().optional().describe("Minimum cost in cents to filter by"),
    cost_max: z.number().positive().optional().describe("Maximum cost in cents to filter by"),
    prompt_token_min: z.number().positive().optional().describe("Minimum number of prompt tokens"),
    prompt_token_max: z.number().positive().optional().describe("Maximum number of prompt tokens"),
    completion_token_min: z.number().positive().optional().describe("Minimum number of completion tokens"),
    completion_token_max: z.number().positive().optional().describe("Maximum number of completion tokens"),
    status_code: z.string().optional().describe("Filter by specific HTTP status codes (comma-separated)"),
    weighted_feedback_min: z.number().min(-10).max(10).optional().describe("Minimum weighted feedback score (-10 to 10)"),
    weighted_feedback_max: z.number().min(-10).max(10).optional().describe("Maximum weighted feedback score (-10 to 10)"),
    virtual_keys: z.string().optional().describe("Filter by specific virtual key slugs (comma-separated)"),
    configs: z.string().optional().describe("Filter by specific config slugs (comma-separated)"),
    workspace_slug: z.string().optional().describe("Filter by specific workspace"),
    api_key_ids: z.string().optional().describe("Filter by specific API key UUIDs (comma-separated)"),
    metadata: z.string().optional().describe("Filter by metadata (stringified JSON object)"),
    ai_org_model: z.string().optional().describe("Filter by AI provider and model (comma-separated, use __ as separator)"),
    trace_id: z.string().optional().describe("Filter by trace IDs (comma-separated)"),
    span_id: z.string().optional().describe("Filter by span IDs (comma-separated)")
  },
  async (params) => {
    try {
      const analytics = await portkeyService.getCostAnalytics(params);
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            summary: {
              total_cost: analytics.summary.total,
              average_cost_per_request: analytics.summary.avg
            },
            data_points: analytics.data_points.map(point => ({
              timestamp: point.timestamp,
              total_cost: point.total,
              average_cost: point.avg
            })),
            object: analytics.object
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching cost analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);