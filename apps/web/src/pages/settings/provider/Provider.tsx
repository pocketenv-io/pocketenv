import { useRouterState } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import {
  usePreferences,
  useUpdatePreferencesMutation,
} from "../../../hooks/usePreferences";
import type { SandboxProvider } from "../../../types/preferences";
import { useSodium } from "../../../hooks/useSodium";
import { PUBLIC_KEY } from "../../../consts";
import { useNotyf } from "../../../hooks/useNotyf";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";

const LABELS = {
  daytona: "Daytona API Key",
  vercel: "Vercel Access Token",
  deno: "Deno Deploy Token",
  sprites: "Sprites API Key",
} as const;

type Provider = keyof typeof LABELS | "cloudflare";

const schema = z
  .object({
    provider: z.enum(["cloudflare", "daytona", "vercel", "deno", "sprites"]),
    apiKey: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider !== "cloudflare" && !data.apiKey?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${LABELS[data.provider as keyof typeof LABELS]} is required`,
        path: ["apiKey"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

function Services() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/provider", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  const notyf = useNotyf();
  const queryClient = useQueryClient();
  const sodium = useSodium();
  const sandboxId = data?.sandbox?.id ?? "";
  const { data: preferences } = usePreferences(sandboxId);
  const { mutateAsync: updatePreferences } = useUpdatePreferencesMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { provider: "cloudflare", apiKey: "" },
  });

  useEffect(() => {
    if (!preferences) return;
    const providerPref = preferences.find(
      (p): p is SandboxProvider =>
        p.$type === "io.pocketenv.sandbox.defs#sandboxProviderPref",
    );
    if (providerPref) {
      setValue("provider", providerPref.name as FormValues["provider"]);
      setValue("apiKey", providerPref.redactedApiKey ?? "");
    }
  }, [preferences, setValue]);

  const provider = useWatch({ control, name: "provider" }) as Provider;

  const onSubmit = async (values: FormValues) => {
    const pref: SandboxProvider = {
      $type: "io.pocketenv.sandbox.defs#sandboxProviderPref",
      name: values.provider,
    };

    if (values.apiKey?.includes("**") && values.provider !== "cloudflare") {
      return;
    }

    if (values.apiKey && !values.apiKey.includes("**")) {
      const sealed = sodium.cryptoBoxSeal(
        sodium.fromString(values.apiKey),
        sodium.fromHex(PUBLIC_KEY),
      );
      pref.apiKey = sodium.toBase64(
        sealed,
        sodium.base64Variants.URLSAFE_NO_PADDING,
      );
      pref.redactedApiKey =
        values.apiKey.length > 14
          ? values.apiKey.slice(0, 11) +
            "*".repeat(24) +
            values.apiKey.slice(-3)
          : values.apiKey;
    }

    try {
      await updatePreferences({ sandboxId, preferences: [pref] });
      await queryClient.invalidateQueries({
        queryKey: ["preferences", sandboxId],
      });
      notyf.open("primary", "Provider saved successfully!");
    } catch {
      notyf.open("error", "Failed to save provider.");
    }
  };

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/provider", "")}
    >
      <>
        <div className="w-[95%] m-auto">
          <div className="flex flex-row items-center">
            <h1 className="mb-1 text-xl flex-1">Sandbox Provider</h1>
          </div>
          <p className="opacity-60 mb-5">
            A Sandbox provider is responsible for running your Sandbox and
            providing the necessary resources.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full overflow-x-auto">
              <div className="flex flex-row">
                <div className="w-96 mr-6">
                  <label className="label-text">
                    Pick your Sandbox Provider
                  </label>
                  <select
                    {...register("provider")}
                    className="select select-lg font-medium text-[15px]"
                  >
                    <option value="cloudflare">
                      Cloudflare Sandbox (Recommended)
                    </option>
                    <option value="daytona">Daytona</option>
                    <option value="vercel">Vercel Sandbox</option>
                    <option value="deno">Deno Sandbox</option>
                    <option value="sprites">Sprites</option>
                  </select>
                </div>
                {provider !== "cloudflare" && (
                  <div className="w-96">
                    <label className="label-text">{LABELS[provider]}</label>
                    <input
                      {...register("apiKey")}
                      type="text"
                      className="input input-lg font-medium text-[15px]"
                    />
                    {errors.apiKey && (
                      <p className="text-error text-sm mt-1">
                        {errors.apiKey.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  className="btn btn-primary font-semibold mt-5"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </>
    </Main>
  );
}

export default Services;
