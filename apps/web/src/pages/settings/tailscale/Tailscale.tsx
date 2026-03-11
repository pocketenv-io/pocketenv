import { zodResolver } from "@hookform/resolvers/zod";
import { useRouterState } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";
import { useNotyf } from "../../../hooks/useNotyf";
import {
  useSaveTailscaleAuthKeyMutation,
  useTailscaleAuthKeyQuery,
} from "../../../hooks/useTailscaleAuthKey";
import { useSodium } from "../../../hooks/useSodium";
import { PUBLIC_KEY } from "../../../consts";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const tailscaleSchema = z.object({
  authKey: z
    .string()
    .min(15)
    .trim()
    .refine((val) => val === "" || val.startsWith("tskey-auth-"), {
      message: "Auth Key must start with tskey-auth-",
    })
    .optional(),
});

type TailscaleFormValues = z.infer<typeof tailscaleSchema>;

function Tailscale() {
  const notyf = useNotyf();
  const queryClient = useQueryClient();
  const sodium = useSodium();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { mutateAsync: saveTailscaleAuthKey } =
    useSaveTailscaleAuthKeyMutation();
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/tailscale", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );
  const { data: tailscaleAuthKey } = useTailscaleAuthKeyQuery(
    data?.sandbox?.id || "",
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TailscaleFormValues>({
    resolver: zodResolver(tailscaleSchema),
  });

  useEffect(() => {
    if (tailscaleAuthKey?.data) {
      setValue("authKey", tailscaleAuthKey.data.authKey);
    }
  }, [tailscaleAuthKey, setValue]);

  const onSubmit = async (values: TailscaleFormValues) => {
    if (values.authKey && !values.authKey.includes("**")) {
      const sealed = sodium.cryptoBoxSeal(
        sodium.fromString(values.authKey),
        sodium.fromHex(PUBLIC_KEY),
      );
      await saveTailscaleAuthKey({
        sandboxId: data!.sandbox!.id,
        authKey: sodium.toBase64(
          sealed,
          sodium.base64Variants.URLSAFE_NO_PADDING,
        ),
        redacted:
          values.authKey.length > 14
            ? values.authKey.slice(0, 11) +
              "*".repeat(values.authKey.length - 14) +
              values.authKey.slice(-3)
            : values.authKey,
      });
    }
    notyf.open("primary", "Auth Key saved successfully!");
    await queryClient.invalidateQueries({
      queryKey: ["tailscaleAuthKey", data?.sandbox?.id],
    });
  };

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/tailscale", "")}
    >
      <>
        <div className="w-[95%] m-auto">
          <div className="flex flex-row items-center">
            <h1 className="mb-2 text-xl flex-1">Tailscale</h1>
          </div>
          <p className="opacity-60 mb-5">
            Connect your Sandbox to your Tailscale network for secure private
            access to services and devices.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className={`input input-bordered w-xl input-lg text-[15px] font-semibold bg-transparent ${errors.authKey ? "input-error" : ""}`}
            >
              <input
                type="text"
                className="grow"
                placeholder="Enter your Tailscale Auth Key"
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                style={{ fontFamily: "CaskaydiaNerdFontMonoRegular" }}
                {...register("authKey")}
              />
            </div>
            {errors.authKey && (
              <p className="text-error text-sm mt-2">
                {errors.authKey.message}
              </p>
            )}
            <div>
              <button
                type="submit"
                className="btn btn-primary font-semibold mt-4"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </>
    </Main>
  );
}

export default Tailscale;
