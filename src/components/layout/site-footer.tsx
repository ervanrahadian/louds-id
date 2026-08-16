import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-5 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-white/70">
          Copyright &copy; {year} —{" "}
          <a
            href={siteConfig.url}
            className="font-medium text-white transition-colors hover:text-accent-400"
          >
            {siteConfig.name}
          </a>
        </p>
        <p className="text-sm text-white/55">{siteConfig.tagline}</p>
      </div>
    </footer>
  );
}
