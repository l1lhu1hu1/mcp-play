import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import 'dotenv/config';

// サーバーインスタンスの作成
export const server = new McpServer({
  name: "mcp-play",
  version: "0.1.0",
});

const getAllTsxFilesContent = async (dirPath: string): Promise<string> => {
  let result = '';

  const files = await readdir(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const fileStat = await stat(fullPath);

    if (fileStat.isDirectory()) {
      // 再帰的に探索
      result += await getAllTsxFilesContent(fullPath);
    } else if (file.endsWith('.tsx')) {
      const content = await readFile(fullPath, 'utf-8');
      result += `\n// ===== File: ${fullPath} =====\n`;
      result += content + '\n';
    }
  }

  return result;
};

server.tool(
  // ツールの名前
  "getDiceRoll",
  // ツールの説明
  "Roll a dice with a specified number of sides and return the result.",
  // ツールの引数を定義するスキーマ
  { sides: z.number().min(1).describe("Number of sides on the die") },
  // ツールが呼び出されたときに実行される関数
  async ({ sides }) => {
    // 1から指定された面数までのランダムな整数を生成
    const roll = Math.floor(Math.random() * sides) + 1;

    return {
      content: [
        {
          type: "text",
          text: roll.toString(),
        },
      ],
    };
  }
);

// Add an addition tool
server.tool(
  "getSumOfTwoNumbers",
  "Add two numbers together and return the result.",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

server.prompt(
  "getReversedText",
  { text: z.string() },
  ({ text }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please reverse text:\n\n${text}`
      }
    }]
  })
);

server.resource(
  "config",
  "config://app",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "App configuration here"
    }]
  })
);

server.resource(
  "TypeScript Style Guide",
  "https://google.github.io/styleguide/tsguide.html",
  async (uri) => {
    const response = await fetch(uri.href);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource: ${response.statusText}`);
    }
    const text = await response.text();

    return {
      contents: [{
        uri: uri.href,
        text: text,
      }]
    };
  }
);

server.resource(
  "echo",
  new ResourceTemplate("echo://{message}", { list: undefined }),
  async (uri, { message }) => ({
    contents: [{
      uri: uri.href,
      text: `Resource echo: ${message}`
    }]
  })
);

server.tool(
  // ツールの名前
  "getComponents",
  // ツールの説明
  "Returns all source code in text format.",
  // ツールの引数を定義するスキーマ
  {},
  // ツールが呼び出されたときに実行される関数
  async () => {
    const allCode = await getAllTsxFilesContent(process.env.COMPONENTS_DIR as string)
    return {
      content: [
        {
          type: "text",
          text: allCode,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // 標準出力をするとサーバーのレスポンスとして解釈されてしまうので、標準エラー出力に出力する
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
