import type { Sandbox } from "../../../types/sandbox";
import _ from "lodash";

export type ProjectProps = {
  sandbox: Sandbox;
};

function Project({ sandbox }: ProjectProps) {
  const onPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const onStop = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const onOpenProject = () => {};

  return (
    <tr className="cursor-pointer" onClick={onOpenProject}>
      <td>{sandbox.name}</td>
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
      <td>March 1, 2024</td>
      <td>
        {sandbox.status === "RUNNING" && (
          <button className="btn btn-circle btn-text btn-sm" onClick={onStop}>
            <span className="icon-[tabler--player-stop] size-5"></span>
          </button>
        )}
        {sandbox.status !== "RUNNING" && (
          <button className="btn btn-circle btn-text btn-sm" onClick={onPlay}>
            <span className="icon-[tabler--player-play] size-5"></span>
          </button>
        )}
        <button className="btn btn-circle btn-text btn-sm">
          <span className="icon-[tabler--dots-vertical] size-5"></span>
        </button>
      </td>
    </tr>
  );
}

export default Project;
