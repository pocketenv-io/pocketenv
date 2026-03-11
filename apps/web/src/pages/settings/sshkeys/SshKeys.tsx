import { zodResolver } from "@hookform/resolvers/zod";
import { useRouterState } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";
import {
  useSaveSshKeyMutation,
  useSshKeys,
  useSshKeysQuery,
} from "../../../hooks/useSshKeys";
import { useNotyf } from "../../../hooks/useNotyf";
import { useSodium } from "../../../hooks/useSodium";
import { PUBLIC_KEY } from "../../../consts";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const sshKeysSchema = z
  .object({
    privateKey: z
      .string()
      .trim()
      .refine(
        (val) =>
          val === "" ||
          (val.startsWith("-----BEGIN OPENSSH PRIVATE KEY-----") &&
            val.includes("-----END OPENSSH PRIVATE KEY-----")),
        {
          message:
            "Private key must start with -----BEGIN OPENSSH PRIVATE KEY----- and end with -----END OPENSSH PRIVATE KEY-----",
        },
      ),
    publicKey: z
      .string()
      .trim()
      .refine(
        (val) =>
          val === "" ||
          val.startsWith("ssh-rsa") ||
          val.startsWith("ssh-ed25519"),
        {
          message: "Public key must start with ssh-rsa or ssh-ed25519",
        },
      ),
  })
  .superRefine((data, ctx) => {
    const hasPrivate = data.privateKey !== "";
    const hasPublic = data.publicKey !== "";
    if (hasPrivate && !hasPublic) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publicKey"],
        message: "Public key is required when a private key is provided",
      });
    }
    if (hasPublic && !hasPrivate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["privateKey"],
        message: "Private key is required when a public key is provided",
      });
    }
  });

type SshKeysFormValues = z.infer<typeof sshKeysSchema>;

function SshKeys() {
  const sodium = useSodium();
  const notyf = useNotyf();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { generateEd25519SSHKeyPair } = useSshKeys();
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/ssh-keys", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  const { mutateAsync: saveSshKeys } = useSaveSshKeyMutation();
  const { data: sshKeys } = useSshKeysQuery(data?.sandbox?.id || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SshKeysFormValues>({
    resolver: zodResolver(sshKeysSchema),
  });

  useEffect(() => {
    if (sshKeys?.data) {
      setValue("privateKey", sshKeys.data.privateKey);
      setValue("publicKey", sshKeys.data.publicKey);
    }
  }, [sshKeys, setValue]);

  const onSubmit = async (values: SshKeysFormValues) => {
    if (!values.privateKey.includes("****")) {
      const sealed = sodium.cryptoBoxSeal(
        sodium.fromString(values.privateKey),
        sodium.fromHex(PUBLIC_KEY),
      );

      await saveSshKeys({
        sandboxId: data!.sandbox!.id,
        privateKey: sodium.toBase64(
          sealed,
          sodium.base64Variants.URLSAFE_NO_PADDING,
        ),
        publicKey: values.publicKey,
        redacted: (() => {
          const header = "-----BEGIN OPENSSH PRIVATE KEY-----";
          const footer = "-----END OPENSSH PRIVATE KEY-----";
          const headerIndex = values.privateKey.indexOf(header);
          const footerIndex = values.privateKey.indexOf(footer);
          if (headerIndex === -1 || footerIndex === -1)
            return values.privateKey;
          const body = values.privateKey
            .slice(headerIndex + header.length, footerIndex)
            .trim();
          const maskedBody =
            body.length > 15
              ? body.slice(0, 10) +
                "*".repeat(body.length - 15) +
                body.slice(-5)
              : body;
          return `${header}\n${maskedBody}\n${footer}`;
        })(),
      });
    }

    notyf.open("primary", "SSH keys saved successfully!");
    await queryClient.invalidateQueries({
      queryKey: ["sshKeys", data?.sandbox?.id],
    });
  };

  const onGenerate = async () => {
    const keypair = await generateEd25519SSHKeyPair("");
    setValue("privateKey", keypair.privateKey, { shouldValidate: true });
    setValue("publicKey", keypair.publicKey, { shouldValidate: true });
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
          <form className="form-control" onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-8">
              <label className="label">
                <span className="label-text font-bold mb-1 text-[14px]">
                  Private Key
                </span>
              </label>
              <textarea
                className={`textarea max-w-full h-[150px] text-[14px] font-semibold ${errors.privateKey ? "textarea-error" : ""}`}
                aria-label="Textarea"
                style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                {...register("privateKey")}
              ></textarea>
              {errors.privateKey && (
                <p className="text-error text-sm mt-2">
                  {errors.privateKey.message}
                </p>
              )}
            </div>
            <div className="mt-8">
              <label className="label">
                <span className="label-text font-bold mb-1 text-[14px]">
                  Public Key
                </span>
              </label>
              <textarea
                className={`textarea max-w-full h-[150px] text-[14px] font-semibold ${errors.publicKey ? "textarea-error" : ""}`}
                aria-label="Textarea"
                style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                {...register("publicKey")}
              ></textarea>
              {errors.publicKey && (
                <p className="text-error text-sm mt-2">
                  {errors.publicKey.message}
                </p>
              )}
            </div>
            <div className="mt-4">
              <button type="submit" className="btn btn-primary w-25">
                Save
              </button>
            </div>
          </form>
        </div>
      </>
    </Main>
  );
}

export default SshKeys;
