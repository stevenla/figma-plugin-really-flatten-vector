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

// somehow unioning something a million times with itself will flatten it out
// pretty nicely. i have no clue why this works but it does.
async function reallyFlattenNodes() {
  const detachedNodes = detachAndUnion(figma.currentPage.selection);

  const promises = detachedNodes.map(async (node) => {
    let rawSVGNode: FrameNode | null = null;
    let outputNode: FrameNode | null = null;
    let outputFrame: FrameNode | null = null;
    let outputVector: VectorNode | null = null;
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
      outputVector = figma.flatten([outputNode]);
      outputVector.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
      outputVector.x = 0;
      outputVector.y = 0;

      outputFrame = figma.createFrame();
      outputFrame.appendChild(outputVector);
      outputFrame.x = node.x + node.width + 20;
      outputFrame.y = node.y;
      outputFrame.resize(outputVector.width, outputVector.height);
      outputFrame.name = `flatten(${node.name})`;
      outputFrame.fills = [];
    } catch (e) {
      console.error(e);
      outputNode?.remove();
      outputFrame?.remove();
      outputVector?.remove();
    }
    node.remove();
    rawSVGNode?.remove();
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
