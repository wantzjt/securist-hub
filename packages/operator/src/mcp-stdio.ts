/**
 * Read-only stdio MCP — local transport only.
 * Tools: get_brief, list_gaps, get_run_metadata
 */
import * as readline from 'node:readline'
import {
  LOCAL_MCP_FORBIDDEN_V1,
  LOCAL_MCP_TOOLS_V1,
  toLocalMcpBriefResponse,
  toLocalMcpRunMetadata,
  wrapLocalMcpResponse,
} from '../../contracts/src/local-assess'
import type { LocalDecisionBriefV1 } from '../../contracts/src/local-assess'
import { loadLatestBrief } from './local-state'

type JsonRpcReq = {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  params?: { name?: string; arguments?: Record<string, unknown> }
}

function respond(id: string | number | null | undefined, result: unknown) {
  process.stdout.write(
    JSON.stringify({ jsonrpc: '2.0', id: id ?? null, result }) + '\n',
  )
}

function respondError(
  id: string | number | null | undefined,
  code: number,
  message: string,
) {
  process.stdout.write(
    JSON.stringify({
      jsonrpc: '2.0',
      id: id ?? null,
      error: { code, message },
    }) + '\n',
  )
}

function requireBrief(): LocalDecisionBriefV1 | null {
  return loadLatestBrief()
}

function handleToolsList() {
  return {
    tools: LOCAL_MCP_TOOLS_V1.map((name) => ({
      name,
      description:
        name === 'get_brief'
          ? 'Minimized local Decision Brief (local_only)'
          : name === 'list_gaps'
            ? 'Evidence gaps and unknowns only'
            : 'Run capability, synthesis, and provenance metadata',
      inputSchema: { type: 'object', properties: {} },
    })),
  }
}

function handleToolCall(name: string, brief: LocalDecisionBriefV1) {
  if ((LOCAL_MCP_FORBIDDEN_V1 as readonly string[]).includes(name)) {
    return {
      error: `Tool forbidden: ${name}`,
    }
  }
  if (!(LOCAL_MCP_TOOLS_V1 as readonly string[]).includes(name)) {
    return { error: `Unknown tool: ${name}` }
  }
  if (name === 'get_brief') {
    return toLocalMcpBriefResponse(brief)
  }
  if (name === 'list_gaps') {
    return wrapLocalMcpResponse({
      evidenceGaps: brief.evidenceGaps,
      unknowns: brief.unknowns,
      visibility: 'local_only' as const,
      shareability: 'never_automatic' as const,
    })
  }
  if (name === 'get_run_metadata') {
    return toLocalMcpRunMetadata(brief)
  }
  return { error: `Unhandled tool: ${name}` }
}

export function runMcpStdio(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })

  // Optional initialize handshake for MCP clients
  rl.on('line', (line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    let req: JsonRpcReq
    try {
      req = JSON.parse(trimmed) as JsonRpcReq
    } catch {
      respondError(null, -32700, 'Parse error')
      return
    }

    const id = req.id
    const method = req.method || ''

    if (method === 'initialize') {
      respond(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'securist-operator',
          version: '0.1.0',
          transport: 'stdio_local',
        },
      })
      return
    }
    if (method === 'notifications/initialized' || method === 'ping') {
      if (method === 'ping') respond(id, {})
      return
    }
    if (method === 'tools/list') {
      respond(id, handleToolsList())
      return
    }
    if (method === 'tools/call') {
      const name = req.params?.name || ''
      const brief = requireBrief()
      if (!brief) {
        respondError(
          id,
          -32000,
          'No local brief in state. Run: securist assess .',
        )
        return
      }
      const result = handleToolCall(name, brief) as Record<string, unknown>
      if ('error' in result && result.error) {
        respondError(id, -32601, String(result.error))
        return
      }
      if ('ok' in result && result.ok === false) {
        respondError(id, -32001, String(result.error ?? 'tool failed'))
        return
      }
      respond(id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
        structuredContent: result,
      })
      return
    }

    respondError(id, -32601, `Method not found: ${method}`)
  })
}
