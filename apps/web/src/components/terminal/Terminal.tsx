/** eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useMemo, useState } from "react";
import { useXTerm } from "react-xtermjs";
import { FitAddon } from "@xterm/addon-fit";
import { API_URL } from "../../consts";

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
  const sessionIdRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const options = useMemo(
    () => ({
      cursorBlink: true,
      cursorStyle: "block" as const,
      fontFamily:
        '"CaskaydiaNerdFontMonoRegular", "JetBrains Mono", "Fira Code", Menlo, Monaco, monospace',
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
    if (!instance) return;

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    instance.loadAddon(fitAddon);

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

    const resizeDisposable = instance.onResize(({ cols, rows }) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "resize", cols, rows }));
      }
    });

    const connect = async () => {
      try {
        const cols = instance.cols;
        const rows = instance.rows;

        instance.write(`\x1b[35mConnecting to SSH session...\x1b[0m\r\n`);

        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/ssh/connect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Sandbox-Id": sandboxId,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ cols, rows }),
        });

        instance.write("\r\x1b[K");

        if (!response.ok) {
          const err = await response.json();
          instance.write(
            `\x1b[38;5;203mSSH connection failed: ${err.message || err.error}\x1b[0m\r\n`,
          );
          return;
        }

        const { sessionId } = await response.json();
        sessionIdRef.current = sessionId;

        const wsBase = API_URL.replace(/^http/, "ws");
        const params = token ? `?token=${encodeURIComponent(token)}` : "";
        const ws = new WebSocket(`${wsBase}/ssh/${sessionId}/ws${params}`);
        wsRef.current = ws;

        ws.onopen = () => {
          instance.focus();
        };

        ws.onmessage = (event) => {
          // Data is base64-encoded
          const bytes = atob(event.data as string);
          const arr = new Uint8Array(bytes.length);
          for (let i = 0; i < bytes.length; i++) {
            arr[i] = bytes.charCodeAt(i);
          }
          const text = new TextDecoder().decode(arr);
          instance.write(text);
        };

        ws.onclose = (event) => {
          if (event.code === 1000) {
            instance.write("\r\n\x1b[38;5;250mSSH session closed.\x1b[0m\r\n");
          } else if (wsRef.current) {
            instance.write("\r\n\x1b[38;5;203mSSH connection lost.\x1b[0m\r\n");
          }
          wsRef.current = null;
          sessionIdRef.current = null;
          onClose();
        };

        ws.onerror = () => {
          // onclose fires right after onerror, so just let it handle cleanup
        };
      } catch (err: any) {
        instance.write(
          `\x1b[38;5;203mFailed to connect: ${err.message}\x1b[0m\r\n`,
        );
      }
    };

    connect();

    // Forward keyboard input to SSH
    const dataDisposable = instance.onData((data) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
    });

    return () => {
      clearTimeout(fitTimer);
      window.removeEventListener("resize", handleResize);
      dataDisposable.dispose();
      resizeDisposable.dispose();

      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      if (sessionIdRef.current) {
        // Fire-and-forget disconnect
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/ssh/disconnect/${sessionIdRef.current}`, {
          method: "DELETE",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }).catch(() => {});
        sessionIdRef.current = null;
      }
    };
  }, [instance, sandboxId, onClose]);

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
  worker: string;
  onClose: () => void;
}

function Terminal({ sandboxId, onClose }: TerminalProps) {
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

export default Terminal;
