"use client";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/src/lib/supabase";

interface AdminAccessGuardProps {
  children: ReactNode;
}

type AccessState =
  | "checking"
  | "allowed"
  | "forbidden";

function isAllowedRole(role: unknown): boolean {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  return (
    normalizedRole === "admin" ||
    normalizedRole === "editor"
  );
}

export default function AdminAccessGuard({
  children,
}: AdminAccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [accessState, setAccessState] =
    useState<AccessState>("checking");

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      setAccessState("checking");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !user) {
        const nextPath = encodeURIComponent(
          pathname || "/admin",
        );

        router.replace(`/login?next=${nextPath}`);
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

      if (!isMounted) return;

      if (
        profileError ||
        !profile ||
        !isAllowedRole(profile.role)
      ) {
        setAccessState("forbidden");
        return;
      }

      setAccessState("allowed");
    }

    void checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (
          event === "SIGNED_OUT" ||
          !session?.user
        ) {
          const nextPath = encodeURIComponent(
            pathname || "/admin",
          );

          router.replace(`/login?next=${nextPath}`);
          return;
        }

        void checkAccess();
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (accessState === "checking") {
    return (
      <main className="admin-access-state">
        <Loader2
          className="admin-access-state__spinner"
          size={30}
        />
        <h1>Admin-Bereich wird geprüft</h1>
        <p>
          Anmeldung und Berechtigung werden kontrolliert.
        </p>

        <style jsx>{`
          .admin-access-state {
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 10px;
            padding: 24px;
            background: #f7f9fb;
            color: #68778a;
            text-align: center;
          }

          .admin-access-state h1 {
            margin: 3px 0 0;
            color: #10233f;
            font-size: 21px;
          }

          .admin-access-state p {
            margin: 0;
            font-size: 12px;
          }

          .admin-access-state__spinner {
            color: #079ca5;
            animation: adminAccessSpin 0.8s linear
              infinite;
          }

          @keyframes adminAccessSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  if (accessState === "forbidden") {
    return (
      <main className="admin-access-state">
        <ShieldAlert size={38} />
        <h1>Kein Zugriff</h1>
        <p>
          Dieser Bereich ist ausschließlich für Admins
          und Editoren zugänglich.
        </p>

        <button
          type="button"
          onClick={() => router.replace("/")}
        >
          Zur Startseite
        </button>

        <style jsx>{`
          .admin-access-state {
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 10px;
            padding: 24px;
            background: #f7f9fb;
            color: #68778a;
            text-align: center;
          }

          .admin-access-state h1 {
            margin: 3px 0 0;
            color: #10233f;
            font-size: 21px;
          }

          .admin-access-state p {
            max-width: 460px;
            margin: 0;
            font-size: 12px;
            line-height: 1.6;
          }

          .admin-access-state button {
            margin-top: 8px;
            padding: 10px 14px;
            border: 0;
            border-radius: 10px;
            background: #079ca5;
            color: #fff;
            font: inherit;
            font-size: 11px;
            font-weight: 750;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

  return children;
}
