import { parseProjectFile } from "@/lib/import/importFile";
import {
  EdgeSchema,
  IconTypeSchema,
  ImportSchema,
  NodeDataSchema,
  NodeHandleConfigSchema,
  NodeSchema,
  PositionSchema,
  ViewportSchema,
} from "@/lib/import/schemas";
import { describe, expect, it } from "vitest";

describe("importFile schema validation", () => {
  describe("PositionSchema", () => {
    it("validates position with numeric x and y", () => {
      const validPosition = { x: 100, y: -250.5 };
      expect(PositionSchema.parse(validPosition)).toEqual(validPosition);
    });

    it("rejects missing x or y", () => {
      expect(() => PositionSchema.parse({ x: 100 })).toThrow();
      expect(() => PositionSchema.parse({ y: 200 })).toThrow();
      expect(() => PositionSchema.parse({ x: "100", y: 200 })).toThrow();
    });
  });

  describe("ViewportSchema", () => {
    it("validates valid viewport object", () => {
      const viewport = { x: 10, y: 20, zoom: 1.5 };
      expect(ViewportSchema.parse(viewport)).toEqual(viewport);
    });

    it("rejects invalid zoom or coordinates", () => {
      expect(() => ViewportSchema.parse({ x: 0, y: 0 })).toThrow();
      expect(() => ViewportSchema.parse({ x: 0, y: 0, zoom: "1" })).toThrow();
    });
  });

  describe("NodeHandleConfigSchema and IconTypeSchema", () => {
    it("validates valid node handle config", () => {
      const handle = { id: "top", type: "target", position: "top" as const };
      expect(NodeHandleConfigSchema.parse(handle)).toEqual(handle);
    });

    it("rejects invalid handle type", () => {
      expect(() => NodeHandleConfigSchema.parse({ id: "h1", type: "invalid" })).toThrow();
    });

    it("validates icon type configuration", () => {
      const icon = { kind: "svg", value: "<svg></svg>" };
      expect(IconTypeSchema.parse(icon)).toEqual(icon);
    });
  });

  describe("NodeDataSchema", () => {
    it("validates full custom node data object", () => {
      const data = {
        kind: "node" as const,
        label: "Database",
        title: "My Database Node",
        description: "Primary PostgreSQL DB",
        color: "#ff0000",
        icon: { kind: "url", value: "https://example.com/icon.png" },
        handles: [{ id: "h1", type: "source" as const, position: "bottom" as const }],
        customExtraField: 1234,
      };

      expect(NodeDataSchema.parse(data)).toEqual(data);
    });

    it("allows empty or optional node data fields", () => {
      const emptyData = {};
      expect(NodeDataSchema.parse(emptyData)).toEqual({});
    });
  });

  describe("NodeSchema", () => {
    it("validates valid node with minimum non-optional fields", () => {
      const minimalNode = {
        id: "node-1",
        position: { x: 50, y: 60 },
        data: {},
      };

      expect(NodeSchema.parse(minimalNode)).toEqual(minimalNode);
    });

    it("validates node with all optional fields", () => {
      const fullNode = {
        id: "node-1",
        type: "aws-ec2",
        position: { x: 50, y: 60 },
        data: {
          kind: "node" as const,
          label: "EC2 Instance",
        },
        parentId: "group-1",
        className: "custom-class",
        width: 120,
        height: 80,
        selected: true,
        hidden: false,
        draggable: true,
        selectable: true,
        connectable: true,
        deletable: true,
        focusable: true,
        zIndex: 5,
        extent: "parent" as const,
        expandParent: false,
        ariaLabel: "EC2 node",
        style: { opacity: 0.9 },
        measured: { width: 120, height: 80 },
      };

      expect(NodeSchema.parse(fullNode)).toEqual(fullNode);
    });

    it("rejects node missing non-optional fields", () => {
      // missing position
      expect(() =>
        NodeSchema.parse({
          id: "n1",
          data: {},
        }),
      ).toThrow();

      // missing id
      expect(() =>
        NodeSchema.parse({
          position: { x: 0, y: 0 },
          data: {},
        }),
      ).toThrow();

      // missing data
      expect(() =>
        NodeSchema.parse({
          id: "n1",
          position: { x: 0, y: 0 },
        }),
      ).toThrow();
    });
  });

  describe("EdgeSchema and EdgeDataSchema", () => {
    it("validates edge with minimum non-optional fields", () => {
      const minimalEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      };

      expect(EdgeSchema.parse(minimalEdge)).toEqual(minimalEdge);
    });

    it("validates edge with all optional fields and edge data", () => {
      const fullEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        type: "smoothstep",
        sourceHandle: "top",
        targetHandle: "bottom",
        animated: true,
        selected: false,
        hidden: false,
        deletable: true,
        focusable: true,
        label: "HTTPS Connection",
        labelStyle: { color: "blue" },
        labelShowBg: true,
        style: { stroke: "#00f" },
        className: "custom-edge",
        zIndex: 1,
        markerEnd: "arrowclosed",
        data: {
          label: "HTTPS",
          protocol: "TCP",
          customAttr: true,
        },
      };

      expect(EdgeSchema.parse(fullEdge)).toEqual(fullEdge);
    });

    it("rejects edge missing non-optional fields", () => {
      expect(() =>
        EdgeSchema.parse({
          id: "e1",
          source: "n1",
        }),
      ).toThrow();
    });
  });

  describe("ImportSchema", () => {
    it("validates a full sysdraw project import file", () => {
      const projectFile = {
        version: "0.1",
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [
          {
            id: "node-1",
            type: "custom-node",
            position: { x: 100, y: 200 },
            data: {
              kind: "node" as const,
              label: "Web Server",
              description: "Nginx reverse proxy",
              icon: { kind: "svg", value: "<path />" },
              handles: [{ id: "out-1", type: "source" as const, position: "right" as const }],
            },
          },
        ],
        edges: [
          {
            id: "edge-1",
            source: "node-1",
            target: "node-2",
            type: "smoothstep",
            animated: true,
            data: {
              label: "HTTP Request",
            },
          },
        ],
      };

      const parsed = ImportSchema.parse(projectFile);
      expect(parsed).toEqual(projectFile);
    });

    it("rejects project file missing required top-level properties", () => {
      expect(() =>
        ImportSchema.parse({
          version: "0.1",
          viewport: { x: 0, y: 0, zoom: 1 },
          nodes: [],
          // missing edges
        }),
      ).toThrow();

      expect(() =>
        ImportSchema.parse({
          // missing version
          viewport: { x: 0, y: 0, zoom: 1 },
          nodes: [],
          edges: [],
        }),
      ).toThrow();
    });
  });

  describe("parseProjectFile helper function", () => {
    const validProject = {
      version: "0.1",
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: "node-1",
          position: { x: 100, y: 200 },
          data: { label: "Test Node" },
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "node-1",
          target: "node-2",
        },
      ],
    };

    it("parses valid project object successfully", () => {
      const result = parseProjectFile(validProject);
      expect(result).toEqual(validProject);
    });

    it("parses stringified JSON project file correctly", () => {
      const jsonString = JSON.stringify(validProject);
      const parsedJson = JSON.parse(jsonString);
      const result = parseProjectFile(parsedJson);

      expect(result).toEqual(validProject);
    });

    it("returns null for invalid project data structure", () => {
      const invalidProject = {
        version: "0.1",
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: "invalid-nodes",
        edges: [],
      };

      const result = parseProjectFile(invalidProject);
      expect(result).toBeNull();
    });

    it("returns null for non-object or null inputs", () => {
      expect(parseProjectFile("not a json object")).toBeNull();
      expect(parseProjectFile(12345)).toBeNull();
      expect(parseProjectFile(null)).toBeNull();
      expect(parseProjectFile(undefined)).toBeNull();
    });
  });
});
