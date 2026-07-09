import { RegisteredGroups } from "@sysdraw/models";
import { AvailabilityZoneGroupComponent } from "./AvailabilityZone";
import { DockerContainerGroupComponent } from "./DockerContainerGroup";
import { VpsGroupComponent } from "./VpsGroup";

export const groupTypes = {
  [RegisteredGroups.AVAILABILITY_ZONE]: AvailabilityZoneGroupComponent,
  [RegisteredGroups.VPS_GROUP]: VpsGroupComponent,
  [RegisteredGroups.DOCKER_CONTAINER_GROUP]: DockerContainerGroupComponent,
};
