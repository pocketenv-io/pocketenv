import SSHTerminal from "./Terminal";
import CloudflareTerminal from "./CloudflareTerminal";

type TerminalProps = {
  sandboxId: string;
  onClose: () => void;
  worker: string;
  isCloudflare?: boolean;
};

function Terminal(props: TerminalProps) {
  const { isCloudflare } = props;
  return (
    <>
      {isCloudflare ? (
        <CloudflareTerminal {...props} />
      ) : (
        <SSHTerminal {...props} />
      )}
    </>
  );
}

export default Terminal;
