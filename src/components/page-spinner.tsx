export function PageSpinner() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Laden"
      className="flex min-h-[60vh] items-center justify-center"
    >
      <svg
        className="size-10 animate-spin text-accent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M12 3a9 9 0 1 1-9 9" />
      </svg>
    </div>
  )
}
