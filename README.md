# Portkey MCP Server
[![smithery badge](https://smithery.ai/badge/@r-huijts/portkey-admin-mcp-server)](https://smithery.ai/server/@r-huijts/portkey-admin-mcp-server)

Transform your AI assistant into a Portkey platform expert! This MCP server connects Claude to Portkey's API, enabling comprehensive management of AI configurations, workspaces, analytics, and user access.

<a href="https://glama.ai/mcp/servers/iftjfqrk0v"><img width="380" height="200" src="https://glama.ai/mcp/servers/iftjfqrk0v/badge" alt="Portkey Server MCP server" /></a>

## Installation

### From Source
1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Copy the example environment file:
```bash
cp .env.example .env
```
4. Add your Portkey API key to the `.env` file:
```bash
PORTKEY_API_KEY=your_portkey_api_key_here
```
5. Then update your Claude configuration file:

```json
{
  "mcpServers": {
    "portkey-server": {
      "command": "node",
      "args": [
        "/path/to/portkey-server/build/index.js"
      ],
      "env": {
        "PORTKEY_API_KEY": "your_portkey_api_key_here"
      }
    }
  }
}
```

Make sure to:
- Replace `/path/to/portkey-server` with the actual path to your installation
- Add your Portkey API key in the `env` section

After updating the configuration, restart Claude Desktop for the changes to take effect.

### Installing via Smithery

To install Portkey MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@r-huijts/portkey-admin-mcp-server):

```bash
npx -y @smithery/cli install @r-huijts/portkey-admin-mcp-server --client claude
```

## Real-World Use Cases
- "What are my current API usage statistics across different models?"
- "Show me the performance metrics for my AI deployments"
- "Create a new workspace for my team's project"
- "What's my current API key usage and remaining credits?"
- "Generate an analytics report for last month's API calls"
- "Set up rate limiting for my development environment"
- "Configure fallback behavior for my production endpoints"
- "Add team members to my Portkey workspace"
- "Show me the latency statistics for my API calls"
- "Set up custom headers for my API requests"

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| PORTKEY_API_KEY | Your Portkey API key (required) |

## 🌟 Features

This MCP server provides comprehensive access to Portkey's platform through the following capabilities:

### User & Access Management
- **User Administration**: List and manage all users in your Portkey organization
- **User Invitations**: Invite new users with customizable roles and permissions
- **Workspace Access**: Configure user access levels across different workspaces
- **Role-Based Control**: Assign admin, manager, or member roles at organization and workspace levels

### Analytics & Reporting
- **Usage Analytics**: Track detailed user activity and request patterns
- **Cost Analysis**: Monitor and analyze costs across different time periods
- **Request Metrics**: View request counts, token usage, and response times
- **Filtered Reports**: Generate reports based on custom criteria like status codes, virtual keys, and time ranges

### Workspace Management
- **Workspace Overview**: List and view detailed information about all workspaces
- **Configuration Management**: Access and review workspace configurations
- **Virtual Key Management**: Monitor and manage API keys with usage limits and rate limits
- **Workspace Settings**: View and track workspace metadata and user associations

### Configuration & API Settings
- **Config Listings**: View all available configurations in your organization
- **Detailed Config Info**: Access cache settings, retry policies, and routing strategies
- **Virtual Key Details**: Monitor key status, usage limits, and rate limits
- **API Integration**: Track API endpoints and their configurations

## License

This project is licensed under the ISC License - see the LICENSE file for details
