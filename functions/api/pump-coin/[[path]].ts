/** Cloudflare Pages Function: proxy Pump coin metadata (CORS-safe). */
const PUMP_COINS = 'https://frontend-api-v3.pump.fun/coins'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders })
}

async function proxyJson(upstream: Response): Promise<Response> {
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

/** POST /api/pump-coin/mints → POST https://frontend-api-v3.pump.fun/coins/mints */
export async function onRequestPost(context: {
  request: Request
  params: { path?: string | string[] }
}): Promise<Response> {
  const raw = context.params.path
  const path = Array.isArray(raw) ? raw.join('/') : (raw || '').replace(/^\/+/, '')
  if (path !== 'mints') {
    return new Response(JSON.stringify({ error: 'POST only supported on /mints' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const body = await context.request.text()
  const upstream = await fetch(`${PUMP_COINS}/mints`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: 'https://pump.fun',
    },
    body,
  })
  return proxyJson(upstream)
}

/**
 * GET /api/pump-coin/:mint
 * Pump often returns 404 for GET /coins/:mint ("Cannot GET"), so we fall back to
 * POST /coins/mints which still works.
 */
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

  // Try legacy GET first
  const getRes = await fetch(`${PUMP_COINS}/${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Origin: 'https://pump.fun',
    },
  })
  if (getRes.ok) return proxyJson(getRes)

  // Fallback: bulk mints POST for a single mint path
  const mint = path.split('/')[0]
  if (!mint || mint === 'mints') {
    return proxyJson(getRes)
  }
  const postRes = await fetch(`${PUMP_COINS}/mints`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: 'https://pump.fun',
    },
    body: JSON.stringify({ mints: [mint] }),
  })
  if (!postRes.ok) return proxyJson(getRes)

  const data = (await postRes.json()) as unknown
  const row = Array.isArray(data)
    ? data.find(
        (c) =>
          c && typeof c === 'object' && String((c as Record<string, unknown>).mint || '') === mint,
      )
    : null
  if (!row) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  return new Response(JSON.stringify(row), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30',
    },
  })
}
