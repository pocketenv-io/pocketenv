import { useNavigate } from "@tanstack/react-router";
import type { Sandbox } from "../../../types/sandbox";
import _ from "lodash";
import dayjs from "dayjs";
import { useState } from "react";
import {
  useStartSandboxMutation,
  useStopSandboxMutation,
} from "../../../hooks/useSandbox";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { profileAtom } from "../../../atoms/profile";

export type ProjectProps = {
  sandbox: Sandbox;
};

function Project({ sandbox }: ProjectProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useAtomValue(profileAtom);
  const { mutateAsync: stopSandbox } = useStopSandboxMutation();
  const { mutateAsync: startSandbox } = useStartSandboxMutation();
  const [displayLoading, setDisplayLoading] = useState(false);

  const onPlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayLoading(true);
    await startSandbox(sandbox.id);
    queryClient.invalidateQueries({
      queryKey: ["actorSandboxes", profile?.did],
    });
    setDisplayLoading(false);
  };

  const onStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayLoading(true);
    await stopSandbox(sandbox.id);
    queryClient.invalidateQueries({
      queryKey: ["actorSandboxes", profile?.did],
    });
    setDisplayLoading(false);
  };

  const onOpenProject = () => {
    navigate({
      to: `/${sandbox.uri.split("at://")[1].replace("io.pocketenv.", "")}`,
    });
  };

  const onOpenContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <tr className="cursor-pointer" onClick={onOpenProject}>
      <td>{sandbox.name}</td>
      <td>{sandbox.base}</td>
      <td>
        <span
          className={`badge badge-soft ${sandbox?.status === "RUNNING" ? "badge-success" : ""} rounded-full ${sandbox.status === "RUNNING" ? "bg-green-400/10" : "bg-white/15 rounded"}`}
        >
          {_.upperFirst(_.camelCase(sandbox.status))}
        </span>
      </td>
      <td>
        <span className="badge badge-soft badge-primary bg-blue-400/10 rounded-full">
          {sandbox?.vcpus} CPU
        </span>
        <span className="badge badge-soft badge-primary bg-blue-400/10 rounded-full ml-2">
          {sandbox?.memory} GiB RAM
        </span>
      </td>
      <td>{dayjs(sandbox.createdAt).format("M/D/YYYY, h:mm:ss A")}</td>
      <td>
        {!displayLoading && sandbox.status === "RUNNING" && (
          <button className="btn btn-circle btn-text btn-sm" onClick={onStop}>
            <span className="icon-[tabler--player-stop] size-5 hover:text-white"></span>
          </button>
        )}
        {!displayLoading && sandbox.status !== "RUNNING" && (
          <button className="btn btn-circle btn-text btn-sm" onClick={onPlay}>
            <span className="icon-[tabler--player-play] size-5 hover:text-white"></span>
          </button>
        )}
        {displayLoading && (
          <span className="loading loading-spinner loading-sm btn-text mr-[10px]"></span>
        )}
        <button
          className="btn btn-circle btn-text btn-sm"
          onClick={onOpenContextMenu}
        >
          <span className="icon-[tabler--dots-vertical] size-5 hover:text-white"></span>
        </button>
      </td>
    </tr>
  );
}

export default Project;
