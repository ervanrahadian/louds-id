import { siteConfig } from "@/lib/site";

export function SplashScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-linear-90 from-brand-600 via-violet-600 to-accent-500 bg-size-[300%_300%] animate-aurora">
      <p className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-4xl">
        {siteConfig.name}
      </p>
      <p className="mt-2 text-sm font-medium text-white/80">
        {siteConfig.tagline}
      </p>
      <span
        className="mt-8 size-10 animate-pulse rounded-full border-2 border-white/40 border-t-white"
        aria-hidden
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
