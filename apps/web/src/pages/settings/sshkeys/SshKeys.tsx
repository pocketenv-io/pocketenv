import { useRouterState } from "@tanstack/react-router";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";
import { useSshKeys } from "../../../hooks/useSshKeys";
import { useState } from "react";

function SshKeys() {
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { generateEd25519SSHKeyPair } = useSshKeys();
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/ssh-keys", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  const onGenerate = async () => {
    const keypair = await generateEd25519SSHKeyPair("");
    setPrivateKey(keypair.privateKey);
    setPublicKey(keypair.publicKey);
  };
  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/ssh-keys", "")}
    >
      <>
        <div className="w-[95%] m-auto">
          <div className="flex flex-row items-center">
            <h1 className="mb-2 text-xl flex-1">SSH Keys</h1>
            <button
              className="btn btn-primary w-25 font-semibold"
              onClick={onGenerate}
            >
              Generate
            </button>
          </div>
          <p className="opacity-60 mb-5">
            SSH keys used to securely access Git repositories or remote servers.
          </p>
          <div className="form-control">
            <div className="mt-8">
              <label className="label">
                <span className="label-text font-bold mb-1 text-[14px]">
                  Private Key
                </span>
              </label>
              <textarea
                className={`textarea max-w-full h-[150px] text-[14px] font-semibold`}
                aria-label="Textarea"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
              ></textarea>
            </div>
            <div className="mt-8">
              <label className="label">
                <span className="label-text font-bold mb-1 text-[14px]">
                  Public Key
                </span>
              </label>
              <textarea
                className={`textarea max-w-full h-[150px] text-[14px] font-semibold`}
                aria-label="Textarea"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
              ></textarea>
            </div>
            <div className="mt-4">
              <button className="btn btn-primary w-25">Save</button>
            </div>
          </div>
        </div>
      </>
    </Main>
  );
}

export default SshKeys;
