/** Cloudflare Pages Function: proxy Pump coin metadata (CORS-safe). */
const PUMP_COINS = 'https://frontend-api-v3.pump.fun/coins'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function onRequestGet(context: {
  request: Request
  params: { path?: string | string[] }
}): Promise<Response> {
  const raw = context.params.path
  const path = Array.isArray(raw) ? raw.join('/') : (raw || '').replace(/^\/+/, '')
  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing mint' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const upstream = await fetch(`${PUMP_COINS}/${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'public, max-age=30',
    },
  })
}
