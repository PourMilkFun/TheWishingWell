import { useEffect, useMemo, useState } from 'react'
import {
  ipfsGatewayCandidates,
  isDisplayableImageSrc,
  isUsableImageUrl,
  rewriteIpfsGateway,
} from '../lib/ipfs'

type Props = {
  url?: string | null
  thumb?: string | null
  emoji?: string
  className?: string
  imgClassName?: string
  emojiClassName?: string
  alt?: string
}

/**
 * Prefer http image (rewritten to a reliable gateway), cycle IPFS gateways on
 * error, then fall back to a local data-URL thumb. Emoji only if all fail.
 */
export function TokenImage({
  url,
  thumb,
  emoji = '🥛',
  className,
  imgClassName = 'absolute inset-0 h-full w-full object-cover',
  emojiClassName = 'relative z-[1] text-3xl drop-shadow-md',
  alt = '',
}: Props) {
  const candidates = useMemo(() => {
    const list: string[] = []
    const push = (u: string) => {
      if (u && !list.includes(u)) list.push(u)
    }
    const http = (url || '').trim()
    if (isUsableImageUrl(http)) {
      // Try preferred rewrite first, then full gateway list
      push(rewriteIpfsGateway(http))
      for (const c of ipfsGatewayCandidates(http)) push(c)
    }
    const t = (thumb || '').trim()
    if (t && /^data:image\//i.test(t)) push(t)
    return list
  }, [url, thumb])

  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
  }, [candidates])

  const src = candidates[idx]
  const showImg = Boolean(src && isDisplayableImageSrc(src))

  if (!showImg) {
    return (
      <div className={className}>
        <span className={emojiClassName}>{emoji}</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <img
        key={src}
        src={src}
        alt={alt}
        className={imgClassName}
        onError={() => {
          setIdx((i) => (i + 1 < candidates.length ? i + 1 : candidates.length))
        }}
      />
      {/* Keep emoji in DOM only as last resort when idx past end */}
      {idx >= candidates.length ? (
        <span className={emojiClassName}>{emoji}</span>
      ) : null}
    </div>
  )
}
