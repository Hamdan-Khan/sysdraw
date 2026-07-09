import type { BaseGroupData } from "../types";
import { availabilityZoneDefaults } from "./AvailailityZone";
import { dockerContainerGroupDefault } from "./DockerContainerGroup";
import { vpsGroupDefault } from "./VpsGroup";

/**
 * list of all registered groups
 */
enum RegisteredGroups {
  AVAILABILITY_ZONE = "availability-zone",
  VPS_GROUP = "vps-group",
  DOCKER_CONTAINER_GROUP = "docker-container-group",
}

/**
 * Map of all registered groups with default data values
 */
const defaultGroupsMap: Record<RegisteredGroups, BaseGroupData> = {
  [RegisteredGroups.AVAILABILITY_ZONE]: availabilityZoneDefaults,
  [RegisteredGroups.VPS_GROUP]: vpsGroupDefault,
  [RegisteredGroups.DOCKER_CONTAINER_GROUP]: dockerContainerGroupDefault,
};

export { defaultGroupsMap, RegisteredGroups };
