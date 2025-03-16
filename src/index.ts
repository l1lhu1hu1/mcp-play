import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";


// サーバーインスタンスの作成
export const server = new McpServer({
  name: "mcp-play",
  version: "0.1.0",
});

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
