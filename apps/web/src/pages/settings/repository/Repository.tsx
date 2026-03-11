import { zodResolver } from "@hookform/resolvers/zod";
import { useRouterState } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSandboxQuery } from "../../../hooks/useSandbox";
import Main from "../../../layouts/Main";
import Sidebar from "../sidebar/Sidebar";
import { useNotyf } from "../../../hooks/useNotyf";
import { useUpdatePreferencesMutation } from "../../../hooks/usePreferences";
import consola from "consola";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const gitUrlSchema = z.object({
  repositoryUrl: z
    .string()
    .trim()
    .nullable()
    .refine(
      (val) =>
        val === "" ||
        val === null ||
        /^(https?:\/\/.+\/.+\/.+|git@.+:.+\/.+)$/.test(val),
      "Must be a valid Git URL (e.g. https://tangled.org/user/repo or git@tangled.org:user/repo)",
    ),
});

type GitUrlFormValues = z.infer<typeof gitUrlSchema>;

function Repository() {
  const notyf = useNotyf();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { mutateAsync: updatePreferences } = useUpdatePreferencesMutation();
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/repository", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );
  const index = Math.floor(Math.random() * 7);
  const hasReset = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GitUrlFormValues>({
    resolver: zodResolver(gitUrlSchema),
  });

  const onSubmit = async (values: GitUrlFormValues) => {
    try {
      await updatePreferences({
        sandboxId: data!.sandbox!.id,
        preferences: [
          {
            repo: values.repositoryUrl === "" ? null : values.repositoryUrl,
            $type: "io.pocketenv.sandbox.defs#sandboxDetailsPref",
          },
        ],
      });
      notyf.open("primary", "Repository added successfully!");
      queryClient.invalidateQueries({
        queryKey: ["sandbox", data!.sandbox!.id],
      });
    } catch (error) {
      consola.error(error);
      notyf.open("error", "Failed to add repository!");
    }
  };

  useEffect(() => {
    if (data?.sandbox && !hasReset.current) {
      hasReset.current = true;
      reset({
        repositoryUrl: data.sandbox.repo,
      });
    }
  }, [data, reset]);

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/repository", "")}
    >
      <>
        <div className="w-[95%] m-auto">
          <h1 className="text-lg">Git Repository</h1>
          <p className="opacity-60 mt-1">
            Bring your project's Git repository into your Sandbox.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className={`input input-bordered w-xl input-lg text-[15px] font-semibold bg-transparent mt-5 ${errors.repositoryUrl ? "input-error" : ""}`}
            >
              <input
                type="text"
                className="grow"
                placeholder={`e.g. ${
                  [
                    "https://tangled.org/tranquil.farm/tranquil-pds",
                    "https://tangled.org/rocksky.app/rocksky",
                    "https://tangled.org/pocketenv.io/pocketenv",
                    "https://tangled.org/zat.dev/zat",
                    "https://tangled.org/pds.ls/pdsls",
                    "https://tangled.org/teal.fm/piper",
                    "https://tangled.org/tangled.org/core",
                  ][index]
                }`}
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                {...register("repositoryUrl")}
              />
            </div>
            {errors.repositoryUrl && (
              <p className="text-error text-sm mt-2">
                {errors.repositoryUrl.message}
              </p>
            )}
            <div className="mt-4">
              <button
                type="submit"
                className="btn btn-primary w-25 font-semibold"
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

export default Repository;
