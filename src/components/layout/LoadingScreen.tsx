/**
 * Lightweight loading indicator shown only while the WebGL scene initialises.
 * The scene is procedural, so this is usually visible for a fraction of a second.
 */
export function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-paper transition-opacity duration-500 ease-out-soft ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          stroke="#2f2a26"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 60 V16 Q20 12 24 12 H48 Q52 12 52 16 V60" />
          <path d="M25 60 V18 H47 V60" strokeWidth="1.5" />
          <path d="M14 60 H58" />
          <circle cx="43" cy="39" r="2" fill="#c0693b" stroke="none">
            {visible && (
              <animate
                attributeName="opacity"
                values="1;0.2;1"
                dur="1.2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </svg>
        <p className="font-hand text-xl text-charcoal">sketching the corridor…</p>
      </div>
    </div>
  )
}
