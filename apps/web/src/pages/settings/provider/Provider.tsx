import { useRouterState } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useSandboxQuery } from "../../../hooks/useSandbox";
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { provider: "daytona", apiKey: "" },
  });

  const provider = useWatch({ control, name: "provider" }) as Provider;

  const onSubmit = (values: FormValues) => {
    console.log(values);
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
