import DOMParser from "dom-parser";

type ContainerNode = InstanceNode | FrameNode | ComponentNode | GroupNode;
function isContainerNode(node: BaseNode): node is ContainerNode {
  return (
    node.type === "INSTANCE" ||
    node.type === "FRAME" ||
    node.type === "COMPONENT" ||
    node.type === "GROUP"
  );
}

function cloneFrame(ref: SceneNode): FrameNode {
  let clone = figma.createFrame();
  clone.name = ref.name;
  // clone.fills = "fills" in ref ? ref.fills : [];
  clone.fills = [];
  clone.resize(ref.width, ref.height);
  clone.x = ref.x;
  clone.y = ref.y;
  clone.rotation = "rotation" in ref ? ref.rotation : 0;
  return clone;
}

function detachAndUnion(nodes: readonly SceneNode[]): readonly FrameNode[] {
  const clones = nodes.map((node) => node.clone());
  const frameClones = clones.map((node) => cloneFrame(node));

  clones
    .filter(isContainerNode)
    .forEach((node, i) => figma.union([node], frameClones[i]));

  frameClones.forEach((node) =>
    node
      .findChildren((child) => child.type === "VECTOR")
      .map((child) => (child as VectorNode).outlineStroke())
  );

  return frameClones;
}

const getSinglePath = (svgstring: string) => {
  let parser = new DOMParser();
  // let svgDOM = parser.parseFromString(svgstring, "image/svg+xml");
  let svgDOM = parser.parseFromString(svgstring);
  let svgEl = svgDOM.getElementsByTagName("svg")[0];

  const paths = svgEl.getElementsByTagName("path");
  // console.log(paths);
  // throw new Error();
  let svgD = [...paths].map((path) => path.getAttribute("d"));
  let joinedD = svgD.join(" ");

  return {
    data: joinedD,
    size: {
      width: svgEl.getAttribute("width"),
      height: svgEl.getAttribute("height"),
    },
    viewBox: svgEl.getAttribute("viewBox"),
  };
};

// somehow unioning something a million times with itself will flatten it out
// pretty nicely. i have no clue why this works but it does.
async function reallyFlattenNodes() {
  const detachedNodes = detachAndUnion(figma.currentPage.selection);

  const promises = detachedNodes.map(async (node) => {
    let rawSVGNode: FrameNode | null = null;
    let outputNode: FrameNode | null = null;
    try {
      const exportOutput = await node.exportAsync({ format: "SVG" });
      const svgString = String.fromCharCode(...exportOutput);

      rawSVGNode = figma.createNodeFromSvg(svgString);
      figma.flatten([figma.union(rawSVGNode.children, rawSVGNode)]);

      const reexportOutput = await rawSVGNode.exportAsync({ format: "SVG" });
      const reexportedSVGString = String.fromCharCode.apply(
        null,
        reexportOutput
      );
      outputNode = figma.createNodeFromSvg(reexportedSVGString);
      const outputVector: VectorNode = outputNode.children[0] as VectorNode;
      outputVector.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
      outputNode.x = node.x + node.width + 20;
      outputNode.y = node.y;
      outputNode.name = `flatten(${node.name})`;
      node.remove();
      rawSVGNode?.remove();
    } catch (e) {
      console.error(e);
      // outputNode?.remove();
    }
    // node.remove();
    // rawSVGNode?.remove();
  });

  await Promise.all(promises);
}

async function main() {
  try {
    await reallyFlattenNodes();
  } catch (e) {}
  figma.closePlugin();
}

main();
