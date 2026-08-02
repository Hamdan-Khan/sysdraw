import { renderToNativeSvg } from "@/lib/svgExport";
import {
  EDGE_LABEL_CLASS_ID,
  EDGE_PATH_CLASS_ID,
  GROUP_CONTAINER_CLASS_ID,
  GROUP_LABEL_CLASS_ID,
  HANDLE_DOT_CLASS_ID,
  NODE_CLASS_ID,
  NODE_ICON_CLASS_ID,
  NODE_WRAPPER_CLASS_ID,
} from "@zero-sketch/common";
import { describe, expect, it } from "vitest";
import { EXPORT_CANVAS_GRID_ID } from "../../components/export/ExportRenderer";

describe("renderToNativeSvg", () => {
  it("inlines stroke and fill presentation attributes on background grid pattern paths", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const bgSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    bgSvg.setAttribute("class", "react-flow__background");
    bgSvg.setAttribute(
      "style",
      "--xy-background-pattern-color-props: rgba(150, 150, 150, 0.3);",
    );

    const gridId = `${EXPORT_CANVAS_GRID_ID}-minor-grid-lines`;

    const pattern = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "pattern",
    );
    pattern.setAttribute("id", gridId);
    pattern.setAttribute("width", "20");
    pattern.setAttribute("height", "20");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M10 0 V20 M0 10 H20");
    path.setAttribute("stroke-width", "1");
    path.setAttribute("class", "react-flow__background-pattern lines");
    pattern.appendChild(path);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", `url(#${gridId})`);

    bgSvg.appendChild(pattern);
    bgSvg.appendChild(rect);
    flowEl.appendChild(bgSvg);

    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600, "#ffffff");
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain('stroke="rgba(150, 150, 150, 0.3)"');
    expect(decodedSvg).toContain('fill="none"');
    expect(decodedSvg).toContain(`fill="url(#${gridId})"`);

    document.body.removeChild(flowEl);
  });

  it("exports connected handle indicator dots on nodes as SVG circles", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const viewportEl = document.createElement("div");
    viewportEl.className = "react-flow__viewport";
    viewportEl.style.transform = "translate(0px, 0px)";

    const nodeEl = document.createElement("div");
    nodeEl.className = `react-flow__node ${NODE_WRAPPER_CLASS_ID} ${NODE_CLASS_ID}`;
    nodeEl.style.transform = "translate(100px, 100px)";
    Object.defineProperty(nodeEl, "offsetWidth", {
      value: 48,
      configurable: true,
    });
    Object.defineProperty(nodeEl, "offsetHeight", {
      value: 48,
      configurable: true,
    });
    nodeEl.getBoundingClientRect = () => ({
      left: 100,
      top: 100,
      width: 48,
      height: 48,
      right: 148,
      bottom: 148,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    const handleEl = document.createElement("div");
    handleEl.className = "react-flow__handle custom-handle";
    handleEl.getBoundingClientRect = () => ({
      left: 121,
      top: 145,
      width: 6,
      height: 6,
      right: 127,
      bottom: 151,
      x: 121,
      y: 145,
      toJSON: () => {},
    });

    const dotSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    dotSvg.setAttribute("class", HANDLE_DOT_CLASS_ID);
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("cx", "3");
    circle.setAttribute("cy", "3");
    circle.setAttribute("r", "2.5");
    circle.setAttribute("fill", "#555");
    dotSvg.appendChild(circle);

    handleEl.appendChild(dotSvg);
    nodeEl.appendChild(handleEl);
    viewportEl.appendChild(nodeEl);
    flowEl.appendChild(viewportEl);
    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600, "#ffffff");
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain(`class="${HANDLE_DOT_CLASS_ID}"`);
    expect(decodedSvg).toContain('<circle cx="3" cy="3" r="2.5"');

    document.body.removeChild(flowEl);
  });

  it("exports edge labels from EdgeLabelRenderer into native SVG background rect and text", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const viewportEl = document.createElement("div");
    viewportEl.className = "react-flow__viewport";
    viewportEl.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const edgesLayer = document.createElement("div");
    edgesLayer.className = "react-flow__edges";

    const labelRenderer = document.createElement("div");
    labelRenderer.className = "react-flow__edgelabel-renderer";

    const labelDiv = document.createElement("div");
    labelDiv.className = `nodrag nopan px-2 py-0.5 rounded bg-white text-primary ${EDGE_LABEL_CLASS_ID}`;
    labelDiv.textContent = "Test Label";
    labelDiv.style.backgroundColor = "rgb(255, 255, 255)";
    labelDiv.style.color = "rgb(15, 23, 42)";
    labelDiv.getBoundingClientRect = () => ({
      left: 500,
      top: 240,
      width: 50,
      height: 20,
      right: 550,
      bottom: 260,
      x: 500,
      y: 240,
      toJSON: () => {},
    });

    labelRenderer.appendChild(labelDiv);
    flowEl.appendChild(viewportEl);
    flowEl.appendChild(edgesLayer);
    flowEl.appendChild(labelRenderer);
    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600, "#ffffff");
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain('<g class="edge-label">');
    expect(decodedSvg).toContain('fill="rgb(255, 255, 255)"');
    expect(decodedSvg).toContain(">Test Label</text>");

    document.body.removeChild(flowEl);
  });

  it("exports group nodes with DOM computed background color and label pill badge", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const viewportEl = document.createElement("div");
    viewportEl.className = "react-flow__viewport";
    viewportEl.style.transform = "translate(0px, 0px)";

    const nodeEl = document.createElement("div");
    nodeEl.className = `react-flow__node ${NODE_WRAPPER_CLASS_ID} parent`;
    nodeEl.style.transform = "translate(100px, 100px)";
    Object.defineProperty(nodeEl, "offsetWidth", {
      value: 668,
      configurable: true,
    });
    Object.defineProperty(nodeEl, "offsetHeight", {
      value: 481,
      configurable: true,
    });
    nodeEl.getBoundingClientRect = () => ({
      left: 100,
      top: 100,
      width: 668,
      height: 481,
      right: 768,
      bottom: 581,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    const innerDiv = document.createElement("div");
    innerDiv.className = `border border-dashed rounded-xl bg-dim ${GROUP_CONTAINER_CLASS_ID}`;
    innerDiv.style.backgroundColor = "rgba(240, 244, 248, 0.8)";
    innerDiv.style.borderColor = "rgb(203, 213, 225)";

    const labelBadge = document.createElement("div");
    labelBadge.className = `absolute -top-3 left-5 bg-dim border rounded-2xl ${GROUP_LABEL_CLASS_ID}`;
    labelBadge.textContent = "Availability Zone";
    labelBadge.style.backgroundColor = "rgba(240, 244, 248, 0.8)";
    labelBadge.style.borderColor = "rgb(203, 213, 225)";
    labelBadge.style.color = "rgb(71, 85, 105)";
    labelBadge.getBoundingClientRect = () => ({
      left: 120,
      top: 88,
      width: 130,
      height: 24,
      right: 250,
      bottom: 112,
      x: 120,
      y: 88,
      toJSON: () => {},
    });

    innerDiv.appendChild(labelBadge);
    nodeEl.appendChild(innerDiv);
    viewportEl.appendChild(nodeEl);
    flowEl.appendChild(viewportEl);
    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600, "#ffffff");
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain('fill="rgba(240, 244, 248, 0.8)"');
    expect(decodedSvg).toContain('<g class="group-label">');
    expect(decodedSvg).toContain(">Availability Zone</text>");

    document.body.removeChild(flowEl);
  });

  it("exports group containers and standard nodes targeted directly via class identifiers", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const viewportEl = document.createElement("div");
    viewportEl.className = "react-flow__viewport";
    viewportEl.style.transform = "translate(0px, 0px)";

    // Group Node
    const groupNode = document.createElement("div");
    groupNode.className = `react-flow__node ${NODE_WRAPPER_CLASS_ID}`;
    groupNode.style.transform = "translate(50px, 50px)";
    Object.defineProperty(groupNode, "offsetWidth", {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(groupNode, "offsetHeight", {
      value: 200,
      configurable: true,
    });

    const groupContainer = document.createElement("div");
    groupContainer.className = `border border-dashed ${GROUP_CONTAINER_CLASS_ID}`;
    groupContainer.style.backgroundColor = "rgb(240, 240, 240)";
    groupContainer.style.borderColor = "rgb(200, 200, 200)";

    const groupLabel = document.createElement("div");
    groupLabel.className = GROUP_LABEL_CLASS_ID;
    groupLabel.textContent = "Test Region";
    groupLabel.style.backgroundColor = "rgb(255, 255, 255)";
    groupLabel.style.color = "rgb(0, 0, 0)";
    groupLabel.getBoundingClientRect = () => ({
      left: 60,
      top: 40,
      width: 80,
      height: 20,
      right: 140,
      bottom: 60,
      x: 60,
      y: 40,
      toJSON: () => {},
    });

    groupContainer.appendChild(groupLabel);
    groupNode.appendChild(groupContainer);
    viewportEl.appendChild(groupNode);

    // Standard Node
    const stdNode = document.createElement("div");
    stdNode.className = `react-flow__node ${NODE_WRAPPER_CLASS_ID} ${NODE_CLASS_ID}`;
    stdNode.style.transform = "translate(100px, 100px)";
    Object.defineProperty(stdNode, "offsetWidth", {
      value: 48,
      configurable: true,
    });
    Object.defineProperty(stdNode, "offsetHeight", {
      value: 48,
      configurable: true,
    });

    viewportEl.appendChild(stdNode);
    flowEl.appendChild(viewportEl);
    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600, "#ffffff");
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain('<g class="group-nodes-layer">');
    expect(decodedSvg).toContain('fill="rgb(240, 240, 240)"');
    expect(decodedSvg).toContain(">Test Region</text>");
    expect(decodedSvg).toContain('<g class="nodes-layer">');

    document.body.removeChild(flowEl);
  });

  it("exports node icon SVG inside NODE_ICON_CLASS_ID container", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const viewportEl = document.createElement("div");
    viewportEl.className = "react-flow__viewport";

    const nodeWrapper = document.createElement("div");
    nodeWrapper.className = `react-flow__node ${NODE_WRAPPER_CLASS_ID}`;
    nodeWrapper.style.transform = "translate(200px, 150px)";
    Object.defineProperty(nodeWrapper, "offsetWidth", {
      value: 64,
      configurable: true,
    });
    Object.defineProperty(nodeWrapper, "offsetHeight", {
      value: 64,
      configurable: true,
    });

    const nodeEl = document.createElement("div");
    nodeEl.className = NODE_CLASS_ID;

    const iconContainer = document.createElement("div");
    iconContainer.className = NODE_ICON_CLASS_ID;

    const iconSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    iconSvg.setAttribute("viewBox", "0 0 24 24");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 2L2 7l10 5 10-5-10-5z");
    path.style.stroke = "rgb(16, 185, 129)";
    iconSvg.appendChild(path);

    iconContainer.appendChild(iconSvg);
    nodeEl.appendChild(iconContainer);
    nodeWrapper.appendChild(nodeEl);
    viewportEl.appendChild(nodeWrapper);
    flowEl.appendChild(viewportEl);
    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600, "#ffffff");
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain('width="64"');
    expect(decodedSvg).toContain('height="64"');
    expect(decodedSvg).toContain('stroke="rgb(16, 185, 129)"');

    document.body.removeChild(flowEl);
  });

  it("exports edges layer with EDGE_PATH_CLASS_ID elements", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const svgLayer = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    svgLayer.setAttribute("class", "react-flow__edges");

    const edgePath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    edgePath.setAttribute(
      "class",
      `react-flow__edge-path ${EDGE_PATH_CLASS_ID}`,
    );
    edgePath.setAttribute("d", "M 10 10 L 100 100");
    edgePath.style.stroke = "rgb(59, 130, 246)";
    edgePath.style.strokeWidth = "2px";

    svgLayer.appendChild(edgePath);
    flowEl.appendChild(svgLayer);
    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600, "#ffffff");
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain('<g class="edges-layer">');
    expect(decodedSvg).toContain('stroke="rgb(59, 130, 246)"');
    expect(decodedSvg).toContain('stroke-width="2px"');

    document.body.removeChild(flowEl);
  });

  it("escapes unsafe XML characters in group labels and edge labels", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const viewportEl = document.createElement("div");
    viewportEl.className = "react-flow__viewport";

    const groupNode = document.createElement("div");
    groupNode.className = `react-flow__node ${NODE_WRAPPER_CLASS_ID}`;
    Object.defineProperty(groupNode, "offsetWidth", {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(groupNode, "offsetHeight", {
      value: 100,
      configurable: true,
    });

    const groupContainer = document.createElement("div");
    groupContainer.className = GROUP_CONTAINER_CLASS_ID;

    const groupLabel = document.createElement("div");
    groupLabel.className = GROUP_LABEL_CLASS_ID;
    groupLabel.textContent = "Label <With> & 'Unsafe' \"Chars\"";
    groupLabel.getBoundingClientRect = () => ({
      left: 10,
      top: 10,
      width: 100,
      height: 20,
      right: 110,
      bottom: 30,
      x: 10,
      y: 10,
      toJSON: () => {},
    });

    groupContainer.appendChild(groupLabel);
    groupNode.appendChild(groupContainer);
    viewportEl.appendChild(groupNode);
    flowEl.appendChild(viewportEl);
    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600);
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain(
      "Label &lt;With&gt; &amp; &apos;Unsafe&apos; &quot;Chars&quot;",
    );

    document.body.removeChild(flowEl);
  });

  it("throws error when group container is not wrapped in NODE_WRAPPER_CLASS_ID element", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const groupContainer = document.createElement("div");
    groupContainer.className = GROUP_CONTAINER_CLASS_ID;
    flowEl.appendChild(groupContainer);
    document.body.appendChild(flowEl);

    expect(() => renderToNativeSvg(flowEl, 800, 600)).toThrow(
      `Group node wrapper not found for group container ${groupContainer}`,
    );

    document.body.removeChild(flowEl);
  });

  it("throws error when standard node is not wrapped in NODE_WRAPPER_CLASS_ID element", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const nodeEl = document.createElement("div");
    nodeEl.className = NODE_CLASS_ID;
    flowEl.appendChild(nodeEl);
    document.body.appendChild(flowEl);

    expect(() => renderToNativeSvg(flowEl, 800, 600)).toThrow(
      `No wrapper found for node ${nodeEl}`,
    );

    document.body.removeChild(flowEl);
  });

  it("extracts translate3d transform coordinates correctly", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    const viewportEl = document.createElement("div");
    viewportEl.className = "react-flow__viewport";
    viewportEl.style.transform = "translate3d(150px, -75px, 0px)";

    flowEl.appendChild(viewportEl);
    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600);
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain('<g transform="translate(150, -75)">');

    document.body.removeChild(flowEl);
  });

  it("defaults translation to (0, 0) when viewport element is missing or transform is empty", () => {
    const flowEl = document.createElement("div");
    flowEl.className = "react-flow";

    document.body.appendChild(flowEl);

    const dataUrl = renderToNativeSvg(flowEl, 800, 600);
    const decodedSvg = decodeURIComponent(
      dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""),
    );

    expect(decodedSvg).toContain('<g transform="translate(0, 0)">');

    document.body.removeChild(flowEl);
  });
});
