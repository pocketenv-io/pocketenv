import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { API_URL } from "../../consts";

const signInSchema = z.object({
  handle: z.string().trim().min(1, { message: "Handle is required" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      handle: "",
    },
  });

  const onSubmit = (data: SignInFormValues) => {
    window.location.href = `${API_URL}/login?handle=${data.handle}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col items-center gap-6 w-[400px]">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-[15px]">Handle</span>
            </label>
            <div
              className={`input input-bordered w-full input-lg text-[15px] font-semibold bg-transparent ${errors.handle ? "input-error" : ""}`}
            >
              <span className="label-text my-auto text-[16px] opacity-50 mr-[10px]">
                @
              </span>
              <input
                {...register("handle")}
                placeholder="alice.bsky.social"
                className="grow"
                autoFocus
              />
            </div>
            {errors.handle && (
              <span className="label-text text-error text-sm mt-1">
                {errors.handle.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-lg font-bold btn-primary border-none w-full"
          >
            Sign In
          </button>
          <p className="text-center text-white/70">
            Don't have an atproto handle yet? You can create one at{" "}
            <a href={`${API_URL}/login?prompt=create`} className="text-primary">
              selfhosted.social
            </a>
            ,{" "}
            <a
              href="https://bsky.app/"
              className="text-primary"
              target="_blank"
            >
              Bluesky
            </a>{" "}
            or any other{" "}
            <a
              href={"https://atproto.com"}
              className="text-primary"
              target="_blank"
            >
              AT Protocol
            </a>{" "}
            service.
          </p>
        </div>
      </form>
    </div>
  );
}

export default SignIn;
