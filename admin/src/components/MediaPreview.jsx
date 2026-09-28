import { useEffect, useState } from 'react'
import { Eye, X } from 'lucide-react'

/**
 * Fixed-size image preview. Always clips to the box (no overflow).
 * Pass src=null for empty state — never pass default male/female placeholders here.
 */
export default function MediaPreview({
  src,
  alt = '',
  className = '',
  placeholder = 'No image',
  fit = 'cover',
}) {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const has = Boolean(src) && !failed

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-lg border border-ink-200 bg-ink-50 ${className}`}
        style={{ minHeight: 80 }}
      >
        {has ? (
          <button
            type="button"
            className="absolute inset-0 block h-full w-full overflow-hidden"
            onClick={() => setOpen(true)}
            title="Click to enlarge"
          >
            <img
              src={src}
              alt={alt}
              className={`h-full w-full ${fit === 'contain' ? 'object-contain bg-white' : 'object-cover'}`}
              onError={() => setFailed(true)}
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 hover:bg-black/30 hover:opacity-100">
              <Eye size={18} />
            </span>
          </button>
        ) : (
          <div className="flex h-full min-h-[80px] w-full items-center justify-center px-2 text-center text-xs text-ink-500">
            {placeholder}
          </div>
        )}
      </div>
      {open && has ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white p-2"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  )
}
