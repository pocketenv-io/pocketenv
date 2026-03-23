import Turnstile, { useTurnstile } from "react-turnstile";
import { useExpandRepo } from "../../hooks/useExpandRepo";
import { useCreateSandboxMutation } from "../../hooks/useSandbox";
import { Route } from "../../routes/new";
import { useEffect, useState } from "react";
import { CF_SITE_KEY } from "../../consts";
import { useNavigate } from "@tanstack/react-router";

function New() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<string | null>(null);
  const { repo, base } = Route.useSearch();
  const repoUrl = useExpandRepo(repo);
  const { mutateAsync } = useCreateSandboxMutation();
  const turnstile = useTurnstile();

  useEffect(() => {
    if (!repoUrl || !challenge) return;

    const createSandbox = async () => {
      const res = await mutateAsync({
        base,
        provider: "cloudflare",
        challenge,
        repo: repoUrl,
      });
      await navigate({
        to: res.data?.uri
          ? `/${res.data?.uri.split("at://")[1].replace("io.pocketenv.", "")}`
          : `/sandbox/${res.data?.id}`,
      });
    };

    createSandbox();
    return () => {
      turnstile.reset();
    };
  }, [repoUrl, base, mutateAsync, turnstile, challenge, navigate]);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-base-100 items-center justify-center">
        <span className="loading loading-spinner loading-xl mr-1.5 text-teal-300"></span>
        <Turnstile
          sitekey={CF_SITE_KEY}
          onVerify={(token) => {
            setChallenge(token);
          }}
        />
      </div>
    </>
  );
}

export default New;
