#!/usr/bin/env node

/**
 * This is a MCP server that provides access to Gyazo images.
 * It allows you to list available images, read image contents, and fetch the latest image.
 * The server uses the Gyazo API to fetch image metadata and content.
 * The server provides a single tool for fetching the latest image content and metadata.
 * The server is started using stdio transport, which allows it to communicate via standard input/output streams.
 * The server requires a Gyazo access token to access the Gyazo API.
 * The access token is read from the GYAZO_ACCESS_TOKEN environment variable.
 * The server is started by running the script with Node.js.
 * The server is implemented using the MCP SDK, which provides a high-level API for building MCP servers.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

dotenv.config();

// Ensure the GYAZO_ACCESS_TOKEN environment variable is set
const GYAZO_ACCESS_TOKEN = process.env.GYAZO_ACCESS_TOKEN;
if (!GYAZO_ACCESS_TOKEN) {
  throw new Error("GYAZO_ACCESS_TOKEN environment variable is required");
}

/**
 * Type alias for a note object.
 */
type GyazoImage = {
  image_id: string;
  permalink_url: string;
  thumb_url: string;
  url: string;
  type: string;
  created_at: string;
  metadata: {
    app: string;
    title: string;
    url: string;
    desc: string;
  };
  ocr?: {
    locale: string;
    description: string;
  };
};

/**
 * Type for search API response.
 */
type SearchedGyazoImage = {
  image_id: string;
  permalink_url: string;
  url: string;
  access_policy: string | null;
  type: string;
  thumb_url: string;
  created_at: string;
  alt_text: string;
};

/**
 * Create an MCP server with capabilities for resources (to list/read images)
 * and tools (to fetch the latest image).
 */
const server = new Server(
  {
    name: "gyazo-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * Handler for listing available images as resources.
 * Each note is exposed as a resource with:
 * - A gyazo-mcp:// URI
 * - Plain text MIME type
 * - Human readable name and description
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const endpoint = "https://api.gyazo.com/api/images";
  const params = new URLSearchParams();
  params.append("access_token", GYAZO_ACCESS_TOKEN);
  params.append("page", "1");
  params.append("per_page", "10");
  const url = `${endpoint}?${params.toString()}`;
  const response = await fetch(url);
  const gyazoImages: GyazoImage[] = await response.json();

  return {
    resources: gyazoImages.map((gyazoImage) => ({
      uri: `gyazo-mcp:///${gyazoImage.image_id}`,
      mimeType: `image/${gyazoImage.type}`,
      name: gyazoImage.metadata.title || gyazoImage.image_id,
    })),
  };
});

const getImageMetadataMarkdown = (gyazoImage: GyazoImage) => {
  let imageMetadataMarkdown = "";
  if (gyazoImage.metadata.title) {
    imageMetadataMarkdown += `### Title:\n${gyazoImage.metadata.title}\n\n`;
  }
  if (gyazoImage.metadata.desc) {
    imageMetadataMarkdown += `### Description:\n${gyazoImage.metadata.desc}\n\n`;
  }
  if (gyazoImage.metadata.app) {
    imageMetadataMarkdown += `### App:\n${gyazoImage.metadata.app}\n\n`;
  }
  if (gyazoImage.metadata.url) {
    imageMetadataMarkdown += `### URL:\n${gyazoImage.metadata.url}\n\n`;
  }
  if (gyazoImage.ocr?.description) {
    imageMetadataMarkdown += `### OCR:\n${gyazoImage.ocr.description}\n\n`;
  }
  if (gyazoImage.ocr?.locale) {
    imageMetadataMarkdown += `### Locale:\n${gyazoImage.ocr.locale}\n\n`;
  }
  return imageMetadataMarkdown;
};

/**
 * Handler for reading the contents of a specific image.
 * Takes a gyazo-mcp:// URI and returns the image contents.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  try {
    const url = request.params.uri.toString();
    const id = url.replace("gyazo-mcp:///", "");
    const endpoint = `https://api.gyazo.com/api/images/${id}`;
    const params = new URLSearchParams();
    params.append("access_token", GYAZO_ACCESS_TOKEN);
    const response = await fetch(`${endpoint}?${params.toString()}`);
    const gyazoImage: GyazoImage = await response.json();
    if (!gyazoImage) {
      throw new Error(`Image ${id} not found`);
    }

    const imageUrl = gyazoImage.url;
    const imageBlob = await fetch(imageUrl).then((res) => res.blob());
    const imageBuffer = await imageBlob.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    const imageMetadataMarkdown = getImageMetadataMarkdown(gyazoImage);

    return {
      contents: [
        {
          uri: url,
          mimeType: `image/${gyazoImage.type}`,
          blob: imageBase64,
        },
        {
          uri: url,
          mimeType: "text/plain",
          text: imageMetadataMarkdown,
        },
      ],
    };
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message}`);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

/**
 * Handler for listing available tools.
 * This server provides a single tool for fetching image metadata.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "gyazo_latest_image",
        description: "Fetch latest image content and metadata from Gyazo",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              const: "gyazo_latest_image",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "gyazo_search",
        description: "Search through user's saved Gyazo images",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (max length: 200 characters)",
            },
            page: {
              type: "integer",
              description: "Page number for pagination",
              minimum: 1,
              default: 1,
            },
            per: {
              type: "integer",
              description: "Number of results per page (max: 100)",
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

/**
 * Handler for calling a tool.
 * This server provides a single tool for fetching image metadata.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "gyazo_search") {
    if (!request.params.arguments || typeof request.params.arguments.query !== "string") {
      throw new Error("Invalid search arguments: query is required and must be a string");
    }

    const endpoint = "https://api.gyazo.com/api/search";
    const params = new URLSearchParams();
    params.append("access_token", GYAZO_ACCESS_TOKEN);
    params.append("query", request.params.arguments.query);

    const page = typeof request.params.arguments.page === "number" ? request.params.arguments.page : 1;
    const per = typeof request.params.arguments.per === "number" ? request.params.arguments.per : 20;

    params.append("page", page.toString());
    params.append("per", per.toString());

    const response = await fetch(`${endpoint}?${params.toString()}`);
    const images: SearchedGyazoImage[] = await response.json();

    if (!images || images.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No images found",
          }
        ]
      };
    }

    const contents = await Promise.all(
      images.map(async (image) => {
        return {
          uri: `gyazo-mcp:///${image.image_id}`,
          mimeType: `image/${image.type}`,
          permalink_url: image.permalink_url,
          url: image.url,
          thumb_url: image.thumb_url,
          created_at: image.created_at,
          alt_text: image.alt_text,
        };
      })
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(contents, null, 2)
        }
      ]
    };
  } else if (request.params.name === "gyazo_latest_image") {
    const endpoint = "https://api.gyazo.com/api/images";
    const params = new URLSearchParams();
    params.append("access_token", GYAZO_ACCESS_TOKEN);
    params.append("page", "1");
    params.append("per_page", "1");
    const response = await fetch(`${endpoint}?${params.toString()}`);
    const images: GyazoImage[] = await response.json();

    if (!images || images.length === 0) {
      throw new Error(`Image not found`);
    }

    const image = images[0];

    const imageUrl = image.url;
    const imageBlob = await fetch(imageUrl).then((res) => res.blob());
    const imageBuffer = await imageBlob.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    return {
      content: [
        {
          type: "image",
          data: imageBase64,
          mimeType: `image/${image.type}`,
        },
        {
          type: "text",
          text: getImageMetadataMarkdown(image),
        },
      ],
    };
  }

  throw new Error(`Tool ${request.params.name} not found`);
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
