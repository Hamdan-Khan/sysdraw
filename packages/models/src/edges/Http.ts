import type { BaseEdgeData } from "../types";

export type HttpCallData = BaseEdgeData & {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
};

export const httpCallDefaults = (): HttpCallData => ({
  label: "HTTP",
  protocol: "HTTP/REST",
  method: "GET",
});
