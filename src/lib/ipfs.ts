import { IPFS_UPLOAD_URL } from './constants'

export interface MetadataUploadResult {
  metadataUri: string
  imageUri?: string
}

const PREFERRED_GATEWAY = 'https://nftstorage.link'

const GATEWAY_ORIGINS = [
  'https://nftstorage.link',
  'https://dweb.link',
  'https://cloudflare-ipfs.com',
  'https://ipfs.io',
] as const

/** True only for durable http(s) image URLs — not blob: or data: previews. */
export function isUsableImageUrl(url: string | undefined | null): boolean {
  const u = (url || '').trim()
  if (!u) return false
  if (/^(blob:|data:)/i.test(u)) return false
  // Same-origin site assets (e.g. /tokens/wish-token.png)
  if (u.startsWith('/') && !u.startsWith('//')) return true
  return /^https?:\/\//i.test(u)
}

/** True for http(s) or data: image URLs that can be shown in an <img>. */
export function isDisplayableImageSrc(url: string | undefined | null): boolean {
  const u = (url || '').trim()
  if (!u) return false
  if (/^data:image\//i.test(u)) return true
  if (u.startsWith('/') && !u.startsWith('//')) return true
  return isUsableImageUrl(u)
}

/**
 * Extract `/ipfs/<cid...>` path (CID + optional subpath) from an IPFS URL.
 */
function extractIpfsPath(url: string): string | null {
  const trimmed = (url || '').trim()
  if (!trimmed) return null
  const m =
    trimmed.match(/\/ipfs\/([a-zA-Z0-9]+(?:\/[^\s?#]*)?)/i) ||
    trimmed.match(/^ipfs:\/\/(?:ipfs\/)?([a-zA-Z0-9]+(?:\/[^\s?#]*)?)/i)
  return m?.[1] ? m[1] : null
}

/**
 * If URL contains `/ipfs/<cid...>`, rewrite host to a preferred gateway.
 * Non-IPFS URLs are returned unchanged.
 */
export function rewriteIpfsGateway(
  url: string,
  gatewayOrigin: string = PREFERRED_GATEWAY,
): string {
  const trimmed = (url || '').trim()
  if (!trimmed) return ''
  const path = extractIpfsPath(trimmed)
  if (!path) return trimmed
  const origin = gatewayOrigin.replace(/\/$/, '')
  return `${origin}/ipfs/${path}`
}

/**
 * Ordered unique gateway candidates for a (possibly flaky) IPFS image URL.
 * 1. original url
 * 2. nftstorage.link
 * 3. dweb.link
 * 4. cloudflare-ipfs.com
 * 5. ipfs.io
 */
export function ipfsGatewayCandidates(url: string): string[] {
  const trimmed = (url || '').trim()
  if (!trimmed) return []
  const path = extractIpfsPath(trimmed)
  if (!path) {
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return [trimmed]
    return isUsableImageUrl(trimmed) ? [trimmed] : []
  }
  const out: string[] = []
  const push = (u: string) => {
    if (u && !out.includes(u)) out.push(u)
  }
  push(trimmed)
  for (const origin of GATEWAY_ORIGINS) {
    push(`${origin}/ipfs/${path}`)
  }
  return out
}

/**
 * Convert ipfs://CID, gateway path, or bare CID to an https URL browsers can load.
 * Prefers nftstorage.link (more reliable than ipfs.io).
 */
export function toHttpImageUrl(uri: string): string {
  const trimmed = (uri || '').trim()
  if (!trimmed) return ''
  if (/^(blob:|data:)/i.test(trimmed)) return ''
  if (/^https?:\/\//i.test(trimmed)) {
    // Prefer a reliable gateway when the URL is IPFS
    return rewriteIpfsGateway(trimmed, PREFERRED_GATEWAY)
  }

  const cid =
    trimmed.match(/^ipfs:\/\/(?:ipfs\/)?([a-zA-Z0-9]+)/i)?.[1] ||
    trimmed.match(/\/ipfs\/([a-zA-Z0-9]+)/)?.[1] ||
    (/^[a-zA-Z0-9]{46,}$/.test(trimmed) ? trimmed : null)

  if (cid) {
    const after =
      trimmed.match(/^ipfs:\/\/(?:ipfs\/)?[a-zA-Z0-9]+(\/.*)?$/i)?.[1] ||
      trimmed.match(/\/ipfs\/[a-zA-Z0-9]+(\/.*)?/)?.[1] ||
      ''
    return `${PREFERRED_GATEWAY}/ipfs/${cid}${after || ''}`
  }
  return trimmed
}

/**
 * Local JPEG/PNG thumbnail of the exact file used to deploy.
 * Max edge 512px, JPEG quality ~0.82. GIFs: first frame via bitmap → JPEG,
 * or PNG if bitmap fails.
 */
export async function fileToThumbDataUrl(file: File): Promise<string> {
  const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name)

  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    bitmap = null
  }

  if (!bitmap) {
    // Last resort for odd GIFs / codecs: read as data URL (may be large)
    if (isGif) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') resolve(reader.result)
          else reject(new Error('Could not read image for thumbnail'))
        }
        reader.onerror = () => reject(new Error('Could not read image for thumbnail'))
        reader.readAsDataURL(file)
      })
      return dataUrl
    }
    throw new Error('Could not create thumbnail from uploaded image')
  }

  try {
    const srcW = bitmap.width
    const srcH = bitmap.height
    if (srcW <= 0 || srcH <= 0) {
      throw new Error('Could not create thumbnail from uploaded image')
    }

    const maxEdge = 512
    const scale = Math.min(1, maxEdge / Math.max(srcW, srcH))
    const outW = Math.max(1, Math.round(srcW * scale))
    const outH = Math.max(1, Math.round(srcH * scale))

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not create thumbnail from uploaded image')

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, outW, outH)

    // Prefer JPEG; fall back to PNG if toDataURL fails oddly
    try {
      const jpeg = canvas.toDataURL('image/jpeg', 0.82)
      if (jpeg.startsWith('data:image/jpeg')) return jpeg
    } catch {
      /* fall through */
    }
    const png = canvas.toDataURL('image/png')
    if (!png.startsWith('data:image/')) {
      throw new Error('Could not create thumbnail from uploaded image')
    }
    return png
  } finally {
    bitmap.close()
  }
}

function pickImageFromUploadJson(json: Record<string, unknown>): string {
  const meta = json.metadata
  const fromMeta =
    meta && typeof meta === 'object' && meta !== null
      ? (meta as Record<string, unknown>).image
      : undefined
  const candidates = [
    fromMeta,
    json.image,
    json.imageUri,
    json.image_uri,
    json.imageUrl,
    json.image_url,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) {
      const http = toHttpImageUrl(c)
      if (isUsableImageUrl(http)) {
        // Prefer nftstorage.link over flaky ipfs.io
        return rewriteIpfsGateway(http, PREFERRED_GATEWAY)
      }
    }
  }
  return ''
}

async function imageFromMetadataUri(metadataUri: string): Promise<string> {
  const http = toHttpImageUrl(metadataUri)
  if (!isUsableImageUrl(http)) return ''
  try {
    const res = await fetch(http)
    if (!res.ok) return ''
    const meta = (await res.json()) as Record<string, unknown>
    const image = meta.image
    if (typeof image !== 'string' || !image.trim()) return ''
    const imgHttp = toHttpImageUrl(image)
    return isUsableImageUrl(imgHttp)
      ? rewriteIpfsGateway(imgHttp, PREFERRED_GATEWAY)
      : ''
  } catch {
    return ''
  }
}

/**
 * Prepare coin art before Pump IPFS upload: center-crop to ≤1024×1024 square,
 * export high-quality JPEG/PNG. GIFs are left untouched so animation survives.
 */
export async function prepareTokenImage(file: File): Promise<File> {
  if (file.type === 'image/gif' || /\.gif$/i.test(file.name)) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  try {
    const srcW = bitmap.width
    const srcH = bitmap.height
    if (srcW <= 0 || srcH <= 0) return file

    const side = Math.min(srcW, srcH)
    const sx = Math.floor((srcW - side) / 2)
    const sy = Math.floor((srcH - side) / 2)
    const out = Math.min(1024, side)

    const canvas = document.createElement('canvas')
    canvas.width = out
    canvas.height = out
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, out, out)

    const preferPng = file.type === 'image/png' || /\.png$/i.test(file.name)
    const mime = preferPng ? 'image/png' : 'image/jpeg'
    const quality = preferPng ? undefined : 0.92

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mime, quality)
    })
    if (!blob) return file

    const name = preferPng ? 'token.png' : 'token.jpg'
    return new File([blob], name, { type: mime, lastModified: Date.now() })
  } finally {
    bitmap.close()
  }
}

/** Upload image + metadata via pump.fun public IPFS (proxied in dev). */
export async function uploadPumpMetadata(params: {
  file: File
  name: string
  symbol: string
  description?: string
  twitter?: string
  telegram?: string
  website?: string
}): Promise<MetadataUploadResult> {
  const form = new FormData()
  form.append('file', params.file, params.file.name || 'image.png')
  form.append('name', params.name)
  form.append('symbol', params.symbol)
  form.append(
    'description',
    params.description || `${params.name} ($${params.symbol}) launched on Wish`,
  )
  form.append('twitter', params.twitter || '')
  form.append('telegram', params.telegram || '')
  form.append('website', params.website || '')
  form.append('showName', 'true')

  const res = await fetch(IPFS_UPLOAD_URL, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `Metadata upload failed (${res.status}): ${text.slice(0, 200) || res.statusText}`,
    )
  }
  const json = (await res.json()) as Record<string, unknown>
  const metadataUri =
    typeof json.metadataUri === 'string'
      ? json.metadataUri
      : typeof json.metadata_uri === 'string'
        ? json.metadata_uri
        : ''
  if (!metadataUri) throw new Error('Metadata upload returned no metadataUri')

  let imageUri = pickImageFromUploadJson(json)
  if (!imageUri) {
    imageUri = await imageFromMetadataUri(metadataUri)
  }

  return {
    metadataUri,
    imageUri: imageUri || undefined,
  }
}
