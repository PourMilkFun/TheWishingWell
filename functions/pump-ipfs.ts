/** Cloudflare Pages Function: proxy metadata uploads to Pump IPFS. */
const PUMP_IPFS = 'https://pump.fun/api/ipfs'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function onRequestPost(context: { request: Request }): Promise<Response> {
  const contentType = context.request.headers.get('content-type')
  if (!contentType) {
    return new Response('Missing content-type', { status: 400, headers: corsHeaders })
  }

  const body = await context.request.arrayBuffer()
  const upstream = await fetch(PUMP_IPFS, {
    method: 'POST',
    headers: { 'content-type': contentType },
    body,
  })

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
    },
  })
}
