# mcp-play
mcp-playは、[modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) を利用して作成したお試し用mcp server。[TypeScript で MCP サーバーを実装し、Claude Desktop から利用する](https://azukiazusa.dev/blog/typescript-mcp-server/#%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97) を参考に作成。

## ClaudeやClineからの利用方法
1. `npm i` を実行し、 `npm run build` を実行する
2. `claude_desktop_config.json` や `cline_mcp_settings.json` に以下のような設定を貼り付ける

```json
{
  "mcpServers": {
    "mcp-play": {
      "command": "/Users/ユーザー名/.volta/bin/node",
      "args": [
        "/absolute/path/to/your/mcp-play/build/index.js"
      ]
    }
  }
}
```

また、`npm run inspect` を利用すれば `@modelcontextprotocol/inspector` での確認も可能。