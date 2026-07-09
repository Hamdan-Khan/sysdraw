import type { BaseNodeData } from "../types";

export type DatabaseSubtype = "sql" | "nosql" | "document" | "time-series" | "object";

export type DatabaseData = BaseNodeData & {
  subtype: DatabaseSubtype;
  consistencyModel?: "strong" | "eventual" | "causal";
  replicationStrategy?: "leader-follower" | "multi-leader" | "leaderless";
};

export const databaseDefaults = (): DatabaseData => ({
  label: "Database",
  icon: "database",
  subtype: "sql",
  consistencyModel: "strong",
  replicationStrategy: "leader-follower",
});
