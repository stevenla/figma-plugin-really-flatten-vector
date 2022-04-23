type GeometryNode = Extract<SceneNode, GeometryMixin>;

/**
 * Returns true if the node implements GeometryMixin,
 * ie it can run outlineStroke().
 */
function isGeometryNode(node: SceneNode): node is GeometryNode {
  return "outlineStroke" in node;
}

/**
 * Clones a list of nodes and flattens them into one vector. Their paths
 * shouldn't be simplified at this stage yet.
 */
function cloneAndFlatten(nodes: readonly SceneNode[]): SceneNode {
  if (nodes.length === 0) {
    throw new Error("No nodes selected");
  }

  const clones = nodes.map((node) => {
    let clone: SceneNode | null = null;

    // If the node itself is a geometry node, then outline it
    // outlineStroke() will return a clone or null
    if (isGeometryNode(node)) {
      clone = node.outlineStroke();
    }
    if (clone == null) {
      clone = node.clone();
    }

    // Outline any nested strokes if possible
    if ("findChildren" in clone) {
      clone
        .findChildren((child) => isGeometryNode(child))
        .forEach((child: GeometryNode) => {
          const vectorNode = child.outlineStroke();
          if (vectorNode) {
            child.parent.appendChild(vectorNode);
            child.remove();
          }
        });
    }
    const unionNode = figma.union([clone], clone.parent);
    return unionNode;
  });

  const flattenedNode = figma.flatten(clones);
  return flattenedNode;
}

/**
 * Flattens a bunch of vector nodes into a single path.
 * Exporting an SVG then re-importing it is a pretty reliable way of merging
 * the paths in a vector. Not sure why, but it works.
 */
async function reallyFlattenNodes(
  nodes: readonly SceneNode[]
): Promise<FrameNode> {
  if (nodes.length == 0) {
    throw new Error("No nodes selected");
  }
  const nameToUse = nodes.length === 1 ? nodes[0].name : undefined;
  const flattenedNode = cloneAndFlatten(nodes);

  const firstExport = await flattenedNode.exportAsync({ format: "SVG" });
  const firstSVGString = String.fromCharCode(...firstExport);

  const outputFrameNode = figma.createNodeFromSvg(firstSVGString);
  const outputVectorNode = figma.flatten([
    figma.union(outputFrameNode.children, outputFrameNode),
  ]);
  const originalX = flattenedNode.absoluteTransform[0][2];
  const originalY = flattenedNode.absoluteTransform[1][2];
  outputFrameNode.x = originalX + flattenedNode.width + 40;
  outputFrameNode.y = originalY;
  outputVectorNode.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];

  flattenedNode.remove();
  if (nameToUse != null) {
    outputFrameNode.name = `flatten(${nameToUse})`;
  }
  return outputFrameNode;
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
