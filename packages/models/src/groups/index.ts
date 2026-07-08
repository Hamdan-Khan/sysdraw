import type { BaseGroupData } from "../types";
import { availabilityZoneDefaults } from "./AvailailityZone";

/**
 * list of all registered groups
 */
enum RegisteredGroups {
  AVAILABILITY_ZONE = "availability-zone",
}

/**
 * Map of all registered groups with default data values
 */
const defaultGroupsMap: Record<RegisteredGroups, () => BaseGroupData> = {
  [RegisteredGroups.AVAILABILITY_ZONE]: availabilityZoneDefaults,
};

export { defaultGroupsMap, RegisteredGroups };
