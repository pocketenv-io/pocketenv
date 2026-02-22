/** eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useMemo, useState } from "react";
import { useXTerm } from "react-xtermjs";
import { FitAddon } from "@xterm/addon-fit";
import { SandboxAddon } from "@cloudflare/sandbox/xterm";
import { CF_URL } from "../../consts";
import { useTerminalTokenQuery } from "../../hooks/useTerminal";
import { createId } from "@paralleldrive/cuid2";
import { useAtom } from "jotai";
import { sessionsAtom } from "../../atoms/sessions";
import { useLocation, useSearch } from "@tanstack/react-router";

const darkTheme = {
  background: "#06051d",
  foreground: "#e5e5e5",
  cursor: "#e5e5e5",
  cursorAccent: "#06051d",
  selectionBackground: "rgba(99, 102, 241, 0.3)",
  scrollbarSliderBackground: "rgba(255, 255, 255, 0.12)",
  scrollbarSliderHoverBackground: "rgba(255, 255, 255, 0.25)",
  scrollbarSliderActiveBackground: "rgba(255, 255, 255, 0.35)",
  black: "#06051d",
  red: "#ef4444",
  green: "#22c55e",
  yellow: "#f59e0b",
  blue: "#6366f1",
  magenta: "#7c3aed",
  cyan: "#3abff8",
  white: "#e5e5e5",
  brightBlack: "#a0a0a0",
  brightRed: "#f87171",
  brightGreen: "#4ade80",
  brightYellow: "#fbbf24",
  brightBlue: "#818cf8",
  brightMagenta: "#a78bfa",
  brightCyan: "#67e8f9",
  brightWhite: "#ffffff",
};

const lightTheme = {
  background: "#ffffff",
  foreground: "#1f2937",
  cursor: "#1f2937",
  cursorAccent: "#ffffff",
  selectionBackground: "rgba(99, 102, 241, 0.3)",
  scrollbarSliderBackground: "rgba(0, 0, 0, 0.12)",
  scrollbarSliderHoverBackground: "rgba(0, 0, 0, 0.25)",
  scrollbarSliderActiveBackground: "rgba(0, 0, 0, 0.35)",
  black: "#1f2937",
  red: "#ef4444",
  green: "#22c55e",
  yellow: "#f59e0b",
  blue: "#6366f1",
  magenta: "#7c3aed",
  cyan: "#0891b2",
  white: "#f9fafb",
  brightBlack: "#6b7280",
  brightRed: "#f87171",
  brightGreen: "#4ade80",
  brightYellow: "#fbbf24",
  brightBlue: "#818cf8",
  brightMagenta: "#a78bfa",
  brightCyan: "#22d3ee",
  brightWhite: "#ffffff",
};

interface TerminalContentProps {
  isDarkMode: boolean;
  sandboxId: string;
  onClose: () => void;
}

function TerminalContent({
  isDarkMode,
  sandboxId,
  onClose,
}: TerminalContentProps) {
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sandboxAddonRef = useRef<SandboxAddon | null>(null);
  const { data: terminalToken, isLoading } = useTerminalTokenQuery();
  const [sessions, setSessions] = useAtom(sessionsAtom);
  const location = useLocation();
  const params = useSearch({
    from: location.pathname.startsWith("/sandbox/")
      ? "/sandbox/$id"
      : "/$did/sandbox/$rkey",
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    setSessions((prevSessions) => ({
      ...prevSessions,
      [sandboxId]: params.sessionId || prevSessions[sandboxId] || createId(),
    }));
  }, [sandboxId, terminalToken, setSessions, params]);

  const options = useMemo(
    () => ({
      cursorBlink: true,
      cursorStyle: "block" as const,
      fontFamily:
        '"Cascadia Code", "JetBrains Mono", "Fira Code", Menlo, Monaco, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      letterSpacing: 0,
      theme,
      allowProposedApi: true,
      scrollback: 5000,
    }),
    [theme],
  );

  const { ref, instance } = useXTerm({ options });

  useEffect(() => {
    if (!instance || isLoading) return;

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    instance.loadAddon(fitAddon);

    const sandboxAddon = new SandboxAddon({
      getWebSocketUrl: ({ sandboxId: addonSandboxId, sessionId }) => {
        const params = new URLSearchParams({});
        if (sessionId) params.set("session", sessionId);
        if (terminalToken) params.set("t", terminalToken.token);
        const url = new URL(
          `${CF_URL}/v1/sandboxes/${addonSandboxId}/ws/terminal`,
        );
        url.search = params.toString();
        return url.toString();
      },
      onStateChange: (state, error) => {
        if (error) {
          instance.write(
            `\r\n\x1b[38;5;203mTerminal error: ${error.message || "unknown"}\x1b[0m\r\n`,
          );
        }
        if (state === "disconnected") {
          onClose();
        }
      },
    });
    sandboxAddonRef.current = sandboxAddon;
    instance.loadAddon(sandboxAddon);

    const fitTimer = setTimeout(() => {
      try {
        fitAddon.fit();
      } catch {
        // ignore fit errors on mount
      }
    }, 100);

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {
        // ignore
      }
    };
    window.addEventListener("resize", handleResize);

    instance.write(`\x1b[35mConnecting to terminal session...\x1b[0m\r\n`);
    sandboxAddon.connect({ sandboxId, sessionId: sessions[sandboxId] });
    instance.focus();

    return () => {
      clearTimeout(fitTimer);
      window.removeEventListener("resize", handleResize);

      const disposable = sandboxAddonRef.current as unknown as {
        disconnect?: () => void;
        dispose?: () => void;
      } | null;
      disposable?.disconnect?.();
      disposable?.dispose?.();
      sandboxAddonRef.current = null;
    };
  }, [instance, sandboxId, onClose, isLoading]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        padding: "8px",
      }}
    />
  );
}

export interface TerminalProps {
  sandboxId: string;
  onClose: () => void;
}

function CloudflareTerminal({ sandboxId, onClose }: TerminalProps) {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <TerminalContent
      key={isDarkMode ? "dark" : "light"}
      isDarkMode={isDarkMode}
      sandboxId={sandboxId}
      onClose={onClose}
    />
  );
}

export default CloudflareTerminal;
