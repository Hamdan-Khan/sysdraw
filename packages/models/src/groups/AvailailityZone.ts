import type { BaseGroupData } from "../types";

export const AVAILABILITY_ZONE_TYPE = "availability-zone" as const;

export type AvailabilityZoneData = BaseGroupData & {
  provider?: string;
  zoneName?: string;
};

export const availabilityZoneDefaults = (): AvailabilityZoneData => ({
  label: "Availability Zone",
  color: "#3b82f6",
});
