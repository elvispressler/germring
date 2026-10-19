type LogoLoaderProps = {
  label?: string;
  message?: string;
  className?: string;
};

export function LogoLoader({
  label = "Seite wird geladen",
  message,
  className = "",
}: LogoLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex min-h-48 flex-col items-center justify-center gap-3 px-4 ${className}`}
    >
      <img
        src="/logo-loading.svg"
        width="132"
        height="132"
        alt=""
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}