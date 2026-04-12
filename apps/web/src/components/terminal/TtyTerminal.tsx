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
  pty?: boolean;
}

function TerminalContent({
  isDarkMode,
  sandboxId,
  onClose,
  pty,
}: TerminalContentProps) {
  // Stable refs so the main effect never re-runs because these changed
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sandboxIdRef = useRef(sandboxId);
  const onCloseRef = useRef(onClose);

  const type = pty ? "pty" : "tty";

  // Keep refs in sync with the latest props after every render,
  // without listing them as effect deps (which would retrigger connect).
  useEffect(() => {
    sandboxIdRef.current = sandboxId;
    onCloseRef.current = onClose;
  });

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

  // The main effect depends only on `instance` — everything else is accessed
  // through stable refs, so the effect (and therefore connect()) runs exactly
  // once per xterm instance lifecycle.
  useEffect(() => {
    if (!instance) return;

    // --- Fit addon setup ---
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

    // --- WebSocket stream ---
    const connect = () => {
      // Guard: don't open a second connection if one is already live.
      // This covers React 18 Strict Mode double-invocation and any accidental
      // re-render that manages to reach this code path.
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        return;
      }

      instance.write(`\x1b[35mConnecting to terminal...\x1b[0m\r\n`);

      const token = localStorage.getItem("token");
      const wsBase = API_URL.replace(/^http/, "ws");
      const params = token ? `?token=${encodeURIComponent(token)}` : "";
      const ws = new WebSocket(
        `${wsBase}/${type}/${sandboxIdRef.current}/ws${params}`,
      );
      wsRef.current = ws;

      ws.onopen = () => {
        // Clear the "Connecting…" line and focus the terminal
        instance.write("\r\x1b[K");
        instance.focus();
        // Sync terminal dimensions immediately after connecting
        ws.send(
          JSON.stringify({ type: "resize", cols: instance.cols, rows: instance.rows }),
        );
      };

      ws.onmessage = (event) => {
        instance.write(event.data as string);
      };

      ws.onclose = (event) => {
        if (event.code === 1000) {
          instance.write(
            `\r\n\x1b[38;5;250mProcess exited.\x1b[0m\r\n`,
          );
          wsRef.current = null;
          onCloseRef.current();
        } else if (wsRef.current) {
          instance.write(
            "\r\n\x1b[38;5;203mTerminal connection lost.\x1b[0m\r\n",
          );
          wsRef.current = null;
        }
      };

      ws.onerror = () => {
        // onclose fires right after onerror, so just let it handle cleanup
      };
    };

    connect();

    // Forward keyboard input to the TTY
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
    };
  }, [instance]);

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

export interface TtyTerminalProps {
  sandboxId: string;
  worker: string;
  onClose: () => void;
  pty?: boolean;
}

function TtyTerminal({ sandboxId, onClose, pty }: TtyTerminalProps) {
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
      pty={pty}
    />
  );
}

export default TtyTerminal;
