import { useState } from "react";
import LoginDialog from "@/components/ui/LoginDialog";
import LandingPageComponent from "./LandingPage";

export default function RouteGuard({ userId, children }: { userId: string, children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(true);

  if (!userId) {
    return (
      <>
        <LoginDialog open={isLoginOpen} onClose={async () => { setIsLoginOpen(false); window.location.href = "/" }} />
        <LandingPageComponent />
      </>
    );
  }

  return children;
}