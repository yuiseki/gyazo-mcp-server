# gyazo-mcp-server

A Model Context Protocol server for Gyazo image integration

This is a TypeScript-based MCP server that provides access to Gyazo images. It allows AI assistants to access and interact with Gyazo images through the Model Context Protocol, providing:

- Resources representing Gyazo images with URIs and metadata
- Tools for fetching the latest image
- Image content and metadata access via the Gyazo API

## Features

### Resources

- List and access Gyazo images via `gyazo-mcp://` URIs
- Each image includes:
  - Original image content
  - Metadata (title, description, app, URL)
  - OCR data (if available)
- Supports various image formats (JPEG, PNG, etc.)

### Tools

- `gyazo_latest_image` - Fetch the most recent image from Gyazo
  - Returns both image content and metadata
  - Includes OCR text if available

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Installation

### Prerequisites

1. Create a Gyazo account if you don't have one: https://gyazo.com
2. Get your Gyazo API access token from: https://gyazo.com/api
3. Set the `GYAZO_ACCESS_TOKEN` environment variable with your token

### Claude Desktop Integration

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gyazo-mcp-server": {
      "command": "/path/to/gyazo-mcp-server/build/index.js",
      "env": {
        "GYAZO_ACCESS_TOKEN": "your-access-token-here"
      }
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
