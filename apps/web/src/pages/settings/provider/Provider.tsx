import { useRouterState } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  vercel: "Vercel API Token",
  deno: "Deno Deploy Token",
  sprites: "Sprites API Key",
  e2b: "E2B Access Token",
} as const;

type Provider = keyof typeof LABELS | "cloudflare" | "modal";

const schema = z
  .object({
    provider: z.enum([
      "cloudflare",
      "daytona",
      "vercel",
      "deno",
      "sprites",
      "modal",
      "e2b",
    ]),
    apiKey: z.string().optional(),
    organizationId: z.string().optional(),
    vercelProjectId: z.string().optional(),
    vercelTeamId: z.string().optional(),
    tokenId: z.string().optional(),
    tokenSecret: z.string().optional(),
    e2bApiKey: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.provider !== "cloudflare" &&
      data.provider !== "modal" &&
      data.provider !== "e2b" &&
      !data.apiKey?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${LABELS[data.provider as keyof typeof LABELS]} is required`,
        path: ["apiKey"],
      });
    }
    if (data.provider === "daytona" && !data.organizationId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Daytona Organization ID is required",
        path: ["organizationId"],
      });
    }
    if (data.provider === "vercel" && !data.vercelProjectId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vercel Project ID is required",
        path: ["vercelProjectId"],
      });
    }
    if (data.provider === "vercel" && !data.vercelTeamId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vercel Team ID is required",
        path: ["vercelTeamId"],
      });
    }
    if (data.provider === "modal" && !data.tokenId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Modal Token ID is required",
        path: ["tokenId"],
      });
    }
    if (data.provider === "modal" && !data.tokenSecret?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Modal Token Secret is required",
        path: ["tokenSecret"],
      });
    }
    if (data.provider === "e2b" && !data.e2bApiKey?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "E2B Access Token is required",
        path: ["e2bApiKey"],
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      provider: "cloudflare",
      apiKey: "",
      vercelProjectId: "",
      vercelTeamId: "",
      tokenId: "",
      tokenSecret: "",
      e2bApiKey: "",
    },
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
      setValue("organizationId", providerPref.organizationId ?? "");
      setValue("vercelProjectId", providerPref.vercelProjectId ?? "");
      setValue("vercelTeamId", providerPref.vercelTeamId ?? "");
      setValue("tokenId", providerPref.redactedModalTokenId ?? "");
      setValue("tokenSecret", providerPref.redactedModalTokenSecret ?? "");
      setValue("e2bApiKey", providerPref.redactedE2bApiKey ?? "");
    }
  }, [preferences, setValue]);

  const provider = watch("provider") as Provider;

  const { onChange: onProviderChange, ...providerRegister } =
    register("provider");

  const onSubmit = async (values: FormValues) => {
    const pref: SandboxProvider = {
      $type: "io.pocketenv.sandbox.defs#sandboxProviderPref",
      name: values.provider,
    };

    if (values.provider === "daytona" && values.organizationId?.trim()) {
      pref.organizationId = values.organizationId.trim();
    }

    if (values.provider === "vercel") {
      pref.vercelProjectId = values.vercelProjectId?.trim();
      pref.vercelTeamId = values.vercelTeamId?.trim();
    }

    if (values.provider === "modal") {
      if (values.tokenId && !values.tokenId.includes("**")) {
        const sealedId = sodium.cryptoBoxSeal(
          sodium.fromString(values.tokenId.trim()),
          sodium.fromHex(PUBLIC_KEY),
        );
        pref.modalTokenId = sodium.toBase64(
          sealedId,
          sodium.base64Variants.URLSAFE_NO_PADDING,
        );
        pref.redactedModalTokenId =
          values.tokenId.length > 14
            ? values.tokenId.slice(0, 11) +
              "*".repeat(24) +
              values.tokenId.slice(-3)
            : values.tokenId;
      }
      if (values.tokenSecret && !values.tokenSecret.includes("**")) {
        const sealed = sodium.cryptoBoxSeal(
          sodium.fromString(values.tokenSecret),
          sodium.fromHex(PUBLIC_KEY),
        );
        pref.modalTokenSecret = sodium.toBase64(
          sealed,
          sodium.base64Variants.URLSAFE_NO_PADDING,
        );
        pref.redactedModalTokenSecret =
          values.tokenSecret.length > 14
            ? values.tokenSecret.slice(0, 11) +
              "*".repeat(24) +
              values.tokenSecret.slice(-3)
            : values.tokenSecret;
      }
    } else if (values.provider === "e2b") {
      if (values.e2bApiKey && !values.e2bApiKey.includes("**")) {
        const sealed = sodium.cryptoBoxSeal(
          sodium.fromString(values.e2bApiKey.trim()),
          sodium.fromHex(PUBLIC_KEY),
        );
        pref.e2bApiKey = sodium.toBase64(
          sealed,
          sodium.base64Variants.URLSAFE_NO_PADDING,
        );
        pref.redactedE2bApiKey =
          values.e2bApiKey.length > 14
            ? values.e2bApiKey.slice(0, 11) +
              "*".repeat(24) +
              values.e2bApiKey.slice(-3)
            : values.e2bApiKey;
      }
    } else if (
      values.apiKey?.includes("**") &&
      values.provider !== "cloudflare"
    ) {
      if (values.provider !== "daytona" && values.provider !== "vercel") {
        return;
      }
    }

    if (
      values.provider !== "modal" &&
      values.provider !== "e2b" &&
      values.apiKey &&
      !values.apiKey.includes("**")
    ) {
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
              <div className="w-fit">
                <div className="flex flex-row">
                  <div className="w-96 mr-6">
                    <label className="label-text">
                      Pick your Sandbox Provider
                    </label>
                    <select
                      {...providerRegister}
                      onChange={(e) => {
                        onProviderChange(e);
                        setValue("apiKey", "");
                        setValue("organizationId", "");
                        setValue("vercelProjectId", "");
                        setValue("vercelTeamId", "");
                        setValue("tokenId", "");
                        setValue("tokenSecret", "");
                        setValue("e2bApiKey", "");
                      }}
                      className="select select-lg font-medium text-[15px]"
                    >
                      <option value="cloudflare">
                        Cloudflare Sandbox (Recommended)
                      </option>
                      <option value="daytona">Daytona</option>
                      <option value="vercel">Vercel Sandbox</option>
                      <option value="deno">Deno Sandbox</option>
                      <option value="sprites">Sprites</option>
                      <option value="modal">Modal</option>
                      <option value="e2b">E2B</option>
                    </select>
                  </div>
                  {provider !== "cloudflare" &&
                    provider !== "modal" &&
                    provider !== "e2b" && (
                      <div className="w-96">
                        <label className="label-text">
                          {LABELS[provider as keyof typeof LABELS]}
                        </label>
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
                {provider === "daytona" && (
                  <div className="w-full mt-4">
                    <label className="label-text">
                      Daytona Organization ID
                    </label>
                    <input
                      {...register("organizationId")}
                      type="text"
                      className="input input-lg font-medium text-[15px]"
                    />
                    {errors.organizationId && (
                      <p className="text-error text-sm mt-1">
                        {errors.organizationId.message}
                      </p>
                    )}
                  </div>
                )}
                {provider === "vercel" && (
                  <div className="flex flex-row mt-4 gap-6">
                    <div className="w-96">
                      <label className="label-text">Vercel Project ID</label>
                      <input
                        {...register("vercelProjectId")}
                        type="text"
                        className="input input-lg font-medium text-[15px]"
                      />
                      {errors.vercelProjectId && (
                        <p className="text-error text-sm mt-1">
                          {errors.vercelProjectId.message}
                        </p>
                      )}
                    </div>
                    <div className="w-96">
                      <label className="label-text">Vercel Team ID</label>
                      <input
                        {...register("vercelTeamId")}
                        type="text"
                        className="input input-lg font-medium text-[15px]"
                      />
                      {errors.vercelTeamId && (
                        <p className="text-error text-sm mt-1">
                          {errors.vercelTeamId.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {provider === "e2b" && (
                  <div className="w-96 mt-4">
                    <label className="label-text">E2B Access Token</label>
                    <input
                      {...register("e2bApiKey")}
                      type="text"
                      className="input input-lg font-medium text-[15px]"
                    />
                    {errors.e2bApiKey && (
                      <p className="text-error text-sm mt-1">
                        {errors.e2bApiKey.message}
                      </p>
                    )}
                  </div>
                )}
                {provider === "modal" && (
                  <div className="flex flex-row mt-4 gap-6">
                    <div className="w-96">
                      <label className="label-text">Modal Token ID</label>
                      <input
                        {...register("tokenId")}
                        type="text"
                        className="input input-lg font-medium text-[15px]"
                      />
                      {errors.tokenId && (
                        <p className="text-error text-sm mt-1">
                          {errors.tokenId.message}
                        </p>
                      )}
                    </div>
                    <div className="w-96">
                      <label className="label-text">Modal Token Secret</label>
                      <input
                        {...register("tokenSecret")}
                        type="text"
                        className="input input-lg font-medium text-[15px]"
                      />
                      {errors.tokenSecret && (
                        <p className="text-error text-sm mt-1">
                          {errors.tokenSecret.message}
                        </p>
                      )}
                    </div>
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
