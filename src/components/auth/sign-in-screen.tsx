import { motion } from "motion/react";
import {
  HiBolt,
  HiChatBubbleLeftRight,
  HiLockClosed,
  HiUserGroup,
} from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Reveal } from "@/components/ui/reveal";
import { useAuth } from "@/hooks/use-auth";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

const highlights = [
  {
    icon: HiBolt,
    title: "Live chat",
    body: "Messages show up for everyone in the group, instantly.",
  },
  {
    icon: HiUserGroup,
    title: "Open groups",
    body: "Pick a group and start talking. No invite needed.",
  },
  {
    icon: HiLockClosed,
    title: "Encrypted messages",
    body: "Chat text is encrypted before it is stored, so it is not saved as plain text.",
  },
  {
    icon: HiChatBubbleLeftRight,
    title: "Easy to find",
    body: "Search groups and last messages from the sidebar.",
  },
];

export function SignInScreen() {
  const { signIn, error, clearError } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 overflow-x-clip">
        <section
          id="home"
          aria-label="Welcome"
          className="relative animate-aurora overflow-hidden bg-linear-90 from-brand-600 via-violet-600 to-accent-500 bg-size-[300%_300%] pb-16 pt-28"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.22),transparent_60%)]"
          />

          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="relative mx-auto w-full max-w-6xl px-5 text-center"
          >
            <motion.h1
              variants={item}
              className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl"
            >
              {siteConfig.name}
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-3 text-base font-medium text-white/90 sm:text-lg"
            >
              {siteConfig.tagline}
            </motion.p>
            <motion.p
              variants={item}
              className="mt-2 text-sm text-white/75 sm:text-base"
            >
              by{" "}
              <a
                href={siteConfig.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white underline-offset-4 transition-colors hover:text-accent-300 hover:underline"
              >
                {siteConfig.author}
              </a>
            </motion.p>
          </motion.div>
        </section>

        <section className="relative z-10 -mt-8 pb-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5">
            <Reveal from="zoom">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-brand-950">
                  Jump into the conversation
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Sign in with Google to join groups and talk instantly.
                </p>

                {error ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
                  >
                    {error}
                    <button
                      type="button"
                      onClick={clearError}
                      className="ml-2 underline"
                    >
                      Dismiss
                    </button>
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => void signIn()}
                  className={cn(
                    "mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition-all hover:scale-[1.02] hover:bg-brand-800 sm:w-auto",
                  )}
                >
                  <FcGoogle className="size-5 rounded-full bg-white" aria-hidden />
                  Continue with Google
                </button>
              </div>
            </Reveal>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((highlight, index) => (
                <li key={highlight.title}>
                  <Reveal from="up" delay={index * 0.06}>
                    <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-brand-900/5 text-brand-800 ring-1 ring-brand-900/10">
                        <highlight.icon className="size-5" aria-hidden />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-brand-950">
                        {highlight.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {highlight.body}
                      </p>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
