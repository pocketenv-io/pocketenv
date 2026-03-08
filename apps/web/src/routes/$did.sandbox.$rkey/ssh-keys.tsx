import { createFileRoute, redirect } from "@tanstack/react-router";
import SshKeysPage from "../../pages/settings/sshkeys/SshKeys";

export const Route = createFileRoute("/$did/sandbox/$rkey/ssh-keys")({
  beforeLoad: () => {
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: SshKeysPage,
});
