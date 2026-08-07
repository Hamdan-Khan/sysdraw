import { CanvasNodeData } from "@/components/nodes/createNodeTypes";
import {
  GROUP_BG_COLOR,
  GROUP_BORDER_COLOR,
  GROUP_BORDER_RADIUS,
  GROUP_BORDER_WIDTH,
  GROUP_LABEL_FONT_SIZE,
  GROUP_LABEL_HEIGHT,
  GROUP_LABEL_LEFT,
  GROUP_LABEL_PADDING_X,
  GROUP_LABEL_TOP,
  GROUP_STROKE_DASHARRAY,
} from "@/components/nodes/group/GenericGroup";
import {
  LABEL_EXTRA_HEIGHT,
  NODE_PADDING,
  NODE_TITLE_COLOR,
  NODE_TITLE_FONT_FAMILY,
  NODE_TITLE_FONT_SIZE,
  NODE_TITLE_FONT_WEIGHT,
} from "@/components/nodes/node/NodeWrapper";
import { createSvgElement, createSvgIconNode } from "./utils";

export function renderGroupNode(
  nodeData: CanvasNodeData,
  nodeWidth: number,
  nodeHeight: number,
): {
  rect: SVGElement | null;
  label: SVGElement | null;
} {
  const rect = createSvgElement("rect", {
    width: nodeWidth - GROUP_BORDER_WIDTH,
    height: nodeHeight - GROUP_BORDER_WIDTH,
    fill: GROUP_BG_COLOR,
    stroke: GROUP_BORDER_COLOR,
    "stroke-width": GROUP_BORDER_WIDTH,
    "stroke-dasharray": GROUP_STROKE_DASHARRAY,
    rx: GROUP_BORDER_RADIUS,
  });

  const { label } = nodeData;
  let labelEl: SVGElement | null = null;

  if (label) {
    const textWidth = Math.max(
      20,
      label.length * (GROUP_LABEL_FONT_SIZE * 0.55),
    );
    const pillWidth = Math.round(textWidth + GROUP_LABEL_PADDING_X * 2);
    const pillHeight = GROUP_LABEL_HEIGHT;
    const lx = GROUP_LABEL_LEFT;
    const ly = GROUP_LABEL_TOP;
    const labelColor = nodeData.color || "#0f172a";

    const labelG = createSvgElement("g");
    const pillRect = createSvgElement("rect", {
      x: lx,
      y: ly,
      width: pillWidth,
      height: pillHeight,
      fill: GROUP_BG_COLOR,
      stroke: GROUP_BORDER_COLOR,
      "stroke-width": 1,
      rx: pillHeight / 2,
      ry: pillHeight / 2,
      "shape-rendering": "geometricPrecision",
    });
    labelG.appendChild(pillRect);

    const labelText = createSvgElement("text", {
      x: lx + pillWidth / 2,
      y: ly + pillHeight / 2,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-family": "Inter, system-ui, sans-serif",
      "font-size": GROUP_LABEL_FONT_SIZE,
      "font-weight": "bold",
      fill: labelColor,
    });
    labelText.textContent = label;
    labelG.appendChild(labelText);

    labelEl = labelG;
  }

  return { rect, label: labelEl };
}

export function renderStandardNode(
  nodeData: CanvasNodeData,
  nodeWidth: number,
  nodeHeight: number,
): {
  icon: SVGElement | null;
  text: SVGElement | null;
} {
  const { title, icon } = nodeData;
  const hasTitle = Boolean(title);
  const padding = NODE_PADDING;

  const contentHeight = hasTitle
    ? Math.max(20, nodeHeight - LABEL_EXTRA_HEIGHT)
    : nodeHeight;
  const iconWidth = Math.max(0, nodeWidth - padding * 2);
  const iconHeight = Math.max(0, contentHeight - padding * 2);
  const iconX = padding;
  const iconY = padding;

  let iconNode: SVGElement | null = null;

  if (icon?.kind === "svg" && icon.value) {
    iconNode = createSvgIconNode(
      icon.value,
      iconX,
      iconY,
      iconWidth,
      iconHeight,
    );
  } else if (icon?.kind === "url" && icon.value) {
    iconNode = createSvgElement("image", {
      href: icon.value,
      x: iconX,
      y: iconY,
      width: iconWidth,
      height: iconHeight,
      preserveAspectRatio: "xMidYMid meet",
    });
  }

  let textNode: SVGElement | null = null;

  if (title) {
    const titleText = createSvgElement("text", {
      x: nodeWidth / 2,
      y: contentHeight + 10,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-family": NODE_TITLE_FONT_FAMILY,
      "font-size": NODE_TITLE_FONT_SIZE,
      "font-weight": NODE_TITLE_FONT_WEIGHT,
      fill: NODE_TITLE_COLOR,
    });
    titleText.textContent = title;
    textNode = titleText;
  }

  return { icon: iconNode, text: textNode };
}
