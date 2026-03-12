import { useEffect, useRef, useMemo, useCallback, useState } from "react";
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

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function TerminalContent({
  isDarkMode,
  sandboxId,
  onClose,
}: TerminalContentProps) {
  const eventSourceRef = useRef<EventSource | null>(null);
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

  // Send raw text input — the /tty/:id/input endpoint expects a plain text body
  const sendInput = useCallback(
    async (data: string) => {
      try {
        await fetch(`${API_URL}/tty/${sandboxId}/input`, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            ...authHeaders(),
          },
          body: data,
        });
      } catch {
        // Silently ignore input errors (session may have closed)
      }
    },
    [sandboxId],
  );

  // Send resize — the /tty/:id/resize endpoint expects JSON { cols, rows }
  const sendResize = useCallback(
    async (cols: number, rows: number) => {
      try {
        await fetch(`${API_URL}/tty/${sandboxId}/resize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({ cols, rows }),
        });
      } catch {
        // Silently ignore resize errors
      }
    },
    [sandboxId],
  );

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
      sendResize(cols, rows);
    });

    // --- SSE stream ---
    // The session is created lazily on the server when the stream is first
    // opened, so there is no explicit connect step.
    const connect = () => {
      instance.write(`\x1b[35mConnecting to terminal...\x1b[0m\r\n`);

      const url = `${API_URL}/tty/${sandboxId}/stream`;

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener("open", () => {
        // Clear the "Connecting…" line and focus the terminal
        instance.write("\r\x1b[K");
        instance.focus();

        // Sync the current terminal dimensions with the server immediately
        sendResize(instance.cols, instance.rows);
      });

      // The server emits `event: output` with `data: { "data": "..." }`
      es.addEventListener("output", (event: MessageEvent) => {
        try {
          const { data } = JSON.parse(event.data) as { data: string };
          instance.write(data);
        } catch {
          // Fallback: write raw data if JSON parsing fails
          instance.write(event.data);
        }
      });

      // The server emits `event: exit` when the process terminates
      es.addEventListener("exit", (event: MessageEvent) => {
        try {
          const { code } = JSON.parse(event.data) as { code: number };
          instance.write(
            `\r\n\x1b[38;5;250mProcess exited with code ${code}.\x1b[0m\r\n`,
          );
        } catch {
          instance.write(`\r\n\x1b[38;5;250mProcess exited.\x1b[0m\r\n`);
        }
        es.close();
        eventSourceRef.current = null;
        onClose();
      });

      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) {
          instance.write(
            "\r\n\x1b[38;5;203mTerminal connection lost.\x1b[0m\r\n",
          );
          eventSourceRef.current = null;
        }
      };
    };

    connect();

    const dataDisposable = instance.onData((data) => {
      sendInput(data);
    });

    return () => {
      clearTimeout(fitTimer);
      window.removeEventListener("resize", handleResize);
      dataDisposable.dispose();
      resizeDisposable.dispose();

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [instance, sendInput, sendResize, sandboxId, onClose]);

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
}

function TtyTerminal({ sandboxId, onClose }: TtyTerminalProps) {
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

export default TtyTerminal;
