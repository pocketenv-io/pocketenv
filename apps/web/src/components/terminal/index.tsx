import SSHTerminal from "./Terminal";
import CloudflareTerminal from "./CloudflareTerminal";
import TtyTerminal from "./TtyTerminal";

type TerminalProps = {
  sandboxId: string;
  onClose: () => void;
  worker: string;
  isCloudflare?: boolean;
  isTty?: boolean;
  pty?: boolean;
};

function Terminal(props: TerminalProps) {
  const { isCloudflare, isTty } = props;
  return (
    <>
      {isCloudflare ? (
        <CloudflareTerminal {...props} /*initialCommand="banner.sh || true"*/ />
      ) : isTty ? (
        <TtyTerminal {...props} />
      ) : (
        <SSHTerminal {...props} />
      )}
    </>
  );
}

export default Terminal;
