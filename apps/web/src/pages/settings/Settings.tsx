import { zodResolver } from "@hookform/resolvers/zod";
import { useRouterState } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSandboxQuery } from "../../hooks/useSandbox";
import Main from "../../layouts/Main";
import Sidebar from "./sidebar/Sidebar";
import { useNotyf } from "../../hooks/useNotyf";

const settingsSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
  topics: z.string().trim().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function Settings() {
  const notyf = useNotyf();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { data } = useSandboxQuery(
    `at:/${pathname.replace("/settings", "").replace("sandbox", "io.pocketenv.sandbox")}`,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  const onSubmit = (values: SettingsFormValues) => {
    console.log(values);
    notyf.open("primary", "Settings saved successfully!");
  };

  return (
    <Main
      sidebar={<Sidebar />}
      root={data?.sandbox?.name}
      rootLink={pathname.replace("/settings", "")}
    >
      <>
        <form
          className="form-control w-[95%] m-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="label">
            <span className="label-text font-bold mb-1 text-[14px]">Name</span>
          </label>
          <div
            className={`input input-bordered w-md input-lg text-[15px] font-semibold bg-transparent ${errors.name ? "input-error" : ""}`}
          >
            <input
              type="text"
              className="grow"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-error text-sm mt-2">{errors.name.message}</p>
          )}
          <div className="mt-8">
            <label className="label">
              <span className="label-text font-bold mb-1 text-[14px]">
                Description
              </span>
            </label>
            <textarea
              className="textarea max-w-full h-[150px] text-[14px] font-semibold"
              aria-label="Textarea"
              {...register("description")}
            ></textarea>
          </div>
          <div className="mt-8">
            <label className="label">
              <span className="label-text font-bold mb-1 text-[14px]">
                Topics
              </span>
            </label>
            <span className="ml-1.25 opacity-50">
              List of topics separated by spaces.
            </span>
            <textarea
              className="textarea max-w-full h-25 text-[14px] font-semibold mt-2"
              aria-label="Textarea"
              {...register("topics")}
            ></textarea>
          </div>
          <div className="mt-4">
            <button type="submit" className="btn btn-primary w-25">
              Save
            </button>
          </div>
        </form>
      </>
    </Main>
  );
}

export default Settings;
