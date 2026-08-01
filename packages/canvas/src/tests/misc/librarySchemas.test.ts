import {
  LibraryManifestSchema,
  LibraryNodeSchema,
} from "@/lib/import/librarySchemas";
import { describe, expect, it } from "vitest";

describe("Library Schemas", () => {
  describe("LibraryNodeSchema", () => {
    it("validates a valid node object", () => {
      const validNode = {
        id: "node-1",
        type: "node",
        label: "Database",
        description: "PostgreSQL Database",
        icon: {
          kind: "svg",
          value: "<svg></svg>",
        },
      };

      const result = LibraryNodeSchema.safeParse(validNode);
      expect(result.success).toBe(true);
    });

    it("validates a valid group object", () => {
      const validGroup = {
        id: "group-1",
        type: "group",
        label: "VPC Group",
      };

      const result = LibraryNodeSchema.safeParse(validGroup);
      expect(result.success).toBe(true);
    });

    it("rejects nodes with invalid type", () => {
      const invalidNode = {
        id: "node-1",
        type: "invalid-type",
        label: "Server",
      };

      const result = LibraryNodeSchema.safeParse(invalidNode);
      expect(result.success).toBe(false);
    });
  });

  describe("LibraryManifestSchema", () => {
    it("validates a complete library manifest", () => {
      const validManifest = {
        id: "custom-lib-1",
        name: "Custom Icons",
        version: "1.0.0",
        description: "My custom library",
        tags: ["custom", "aws"],
        nodes: [
          {
            id: "node-1",
            type: "node",
            label: "EC2 Instance",
          },
        ],
      };

      const result = LibraryManifestSchema.safeParse(validManifest);
      expect(result.success).toBe(true);
    });

    it("rejects manifest with empty or missing name", () => {
      const invalidManifest = {
        id: "lib-1",
        name: "",
        version: "1.0.0",
        nodes: [],
      };

      const result = LibraryManifestSchema.safeParse(invalidManifest);
      expect(result.success).toBe(false);
    });

    it("rejects manifest missing required fields", () => {
      const invalidManifest = {
        name: "Incomplete Library",
      };

      const result = LibraryManifestSchema.safeParse(invalidManifest);
      expect(result.success).toBe(false);
    });
  });
});
