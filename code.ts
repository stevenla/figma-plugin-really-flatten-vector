type GeometryNode = Extract<SceneNode, GeometryMixin>;
const DEFAULT_PAINT: SolidPaint = {
  type: "SOLID",
  color: { r: 0.5, g: 0.5, b: 0.5 },
};

/**
 * Returns true if the node implements GeometryMixin, ie has outlineStroke().
 */
function isGeometryNode(node: SceneNode): node is GeometryNode {
  return "outlineStroke" in node;
}

/**
 * Clones a list of nodes and flattens them into one vector. Their paths
 * shouldn't be simplified at this stage yet.
 */
function cloneAndFlatten(nodes: readonly SceneNode[]): VectorNode {
  if (nodes.length === 0) {
    throw new Error("No nodes selected");
  }

  let fillToUse: null | Paint[] = null;
  function setFillIfNonContainer(node: SceneNode) {
    // If there isn't a fill already set, and the node isn't a frame, and the
    // node has fills, then set the fill to use
    if (
      fillToUse == null &&
      node != null &&
      node.type !== "FRAME" &&
      "fills" in node &&
      Array.isArray(node.fills) &&
      node.fills.length > 0 &&
      node.fills.some((fill: Paint) => fill.visible === true)
    ) {
      fillToUse = [...node.fills];
    }
  }

  const clones = nodes.map((node) => {
    let clone: SceneNode = node.clone();
    let outlinedNode: VectorNode = null;

    setFillIfNonContainer(clone);

    // This will create a new node with the outlined stroke as a path. Save it
    // and add it to the union for flattening later.
    if (isGeometryNode(clone)) {
      outlinedNode = clone.outlineStroke();
      setFillIfNonContainer(outlinedNode);
    }

    // Outline any nested strokes if possible
    if ("findChildren" in clone) {
      clone
        .findChildren((child) => isGeometryNode(child))
        .forEach((child: GeometryNode) => {
          setFillIfNonContainer(child);
          const vectorNode = child.outlineStroke();
          if (vectorNode) {
            setFillIfNonContainer(vectorNode);
            child.parent.appendChild(vectorNode);
          }
        });
    }
    const unionTarget = [clone, outlinedNode].filter((x) => x != null);
    const unionNode = figma.union(unionTarget, clone.parent);
    return unionNode;
  });

  const flattenedNode = figma.flatten(clones);
  flattenedNode.fills = fillToUse?.length ? fillToUse : [DEFAULT_PAINT];
  return flattenedNode;
}

/**
 * Flattens a bunch of vector nodes into a single path.
 * Exporting an SVG then re-importing it is a pretty reliable way of merging
 * overlapping paths in a vector. Not sure why, but it works great!
 */
async function reallyFlattenNodes(
  nodes: readonly SceneNode[]
): Promise<VectorNode> {
  if (nodes.length == 0) {
    throw new Error("No nodes selected");
  }
  const nameToUse = nodes.length === 1 ? nodes[0].name : undefined;

  // Flatten the nodes and export it as an SVG
  const flattenedNode = cloneAndFlatten(nodes);
  const exportData = await flattenedNode.exportAsync({ format: "SVG" });
  const exportSVGString = String.fromCharCode(...exportData);

  // Generate a FrameNode containing a VectorNode that has the SVG's
  // overlapping paths merged.
  const outputFrameNode = figma.createNodeFromSvg(exportSVGString);

  // Flatten the VectorNode if multiple vectors were created. This shouldn't
  // happen but it's here for safety.
  const outputVectorNode = figma.flatten([
    figma.union(outputFrameNode.children, outputFrameNode),
  ]);
  outputVectorNode.fills = flattenedNode.fills;
  outputFrameNode.parent.appendChild(outputVectorNode);
  const originalX = flattenedNode.absoluteTransform[0][2];
  outputVectorNode.x = originalX + flattenedNode.width + 40;
  const originalY = flattenedNode.absoluteTransform[1][2];
  outputVectorNode.y = originalY;
  outputVectorNode.exportSettings = [{ format: "SVG" }];
  if (nameToUse != null) {
    outputVectorNode.name = `flatten(${nameToUse})`;
  }

  outputFrameNode.remove();
  flattenedNode.remove();
  return outputVectorNode;
}

async function main() {
  try {
    const outputNode = await reallyFlattenNodes(figma.currentPage.selection);
    figma.currentPage.selection = [outputNode];
  } catch (e) {
    if (e instanceof Error) {
      figma.notify(e.message);
    } else {
      figma.notify(
        "Could not flatten vector. Try simplifying the structure, then try again."
      );
    }
    console.error(e);
  }
  figma.closePlugin();
}

main();
