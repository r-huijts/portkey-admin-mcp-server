import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Portkey } from "portkey-ai";
import dotenv from 'dotenv';
dotenv.config();

// Create an MCP server
const server = new Server({
  name: "portkey-server",
  version: "1.0.0",
}, {
  capabilities: {
    resources: {}
  }
});

// Initialize Portkey client
const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY
});

// Add users list resource
server.setRequestHandler("resources/list", async () => {
  return {
    resources: [{
      uri: "portkey://users",
      name: "Portkey Users",
      description: "List of all users in the Portkey organization"
    }]
  };
});

// Handle reading the users resource
server.setRequestHandler("resources/read", async (request) => {
  if (request.params.uri === "portkey://users") {
    try {
      const users = await portkey.admin.users.list();
      return {
        contents: [{
          uri: "portkey://users",
          mimeType: "application/json",
          text: JSON.stringify(users.data, null, 2)
        }]
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users from Portkey");
    }
  }
  throw new Error("Resource not found");
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);