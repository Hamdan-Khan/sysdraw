import type { BaseGroupData } from "../types";

export type DockerContainerGroupData = BaseGroupData & {};

export const dockerContainerGroupDefault: DockerContainerGroupData = {
  label: "Docker Container",
  color: "#0ea5e9", // Docker blue
};
