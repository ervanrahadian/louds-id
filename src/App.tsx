import { lazy, Suspense } from "react";

import { SignInScreen } from "@/components/auth/sign-in-screen";
import { SplashScreen } from "@/components/layout/splash-screen";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { useAuth } from "@/hooks/use-auth";

const ChatApp = lazy(async () => {
  const module = await import("@/components/chat/chat-app");
  return { default: module.ChatApp };
});

export default function App() {
  const { user, loading } = useAuth();

  return (
    <>
      {loading ? (
        <SplashScreen />
      ) : user ? (
        <Suspense fallback={<SplashScreen />}>
          <ChatApp user={user} />
        </Suspense>
      ) : (
        <SignInScreen />
      )}
      <ServiceWorkerRegistrar />
    </>
  );
}
