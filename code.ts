const DEFAULT_PAINT: SolidPaint = {
  type: "SOLID",
  color: { r: 0.5, g: 0.5, b: 0.5 },
};

const IDENTITY: Transform = [
  [1, 0, 0],
  [0, 1, 0],
];

/**
 * Returns a node's fills if they are visible
 */
function getVisibleFills(node: SceneNode): Paint[] {
  const isVisible = (fill: Paint) => fill.visible === true;
  if (
    "fills" in node &&
    Array.isArray(node.fills) &&
    node.fills.length > 0 &&
    node.fills.some(isVisible)
  ) {
    return [...node.fills].filter(isVisible);
  }
  return [];
}

/**
 * Gets the difference in absolute position between two nodes. The result will
 * be positive if b is more right and down.
 */
function getAbsoluteTransformDiff(
  a: SceneNode | BaseNode,
  b: SceneNode | BaseNode
): { x: number; y: number } {
  const aTransform = "absoluteTransform" in a ? a.absoluteTransform : IDENTITY;
  const bTransform = "absoluteTransform" in b ? b.absoluteTransform : IDENTITY;
  return {
    x: bTransform[0][2] - aTransform[0][2],
    y: bTransform[1][2] - aTransform[1][2],
  };
}

/**
 * Flattens a list of nodes in-place without cloning. Converts all strokes and
 * text to filled outlines, and picks the first fill paints in the layers list.
 * This works because flattening a boolean operation merges the paths together,
 * simplifying the paths into as few paths as possible.
 */
function deeplyFlatten(nodes: readonly SceneNode[]): VectorNode {
  const nameToUse = nodes.length === 1 ? nodes[0].name : "Flattened";
  let fillToUse: Paint[] = [];
  const workingList: SceneNode[] = [...nodes];

  // Populate the working list and ungroup anything with children
  for (let i = 0; i < workingList.length; i++) {
    const current: SceneNode = workingList[i];
    const parent = current.parent;
    const isTopLevel = current.parent.type === "PAGE";
    if ("children" in current && current.type !== "BOOLEAN_OPERATION") {
      // Add children to the working list
      workingList.push(...current.children);

      // If this isn't a top-level node, then flatten its children one level
      if (!isTopLevel) {
        for (const child of current.children) {
          const diff = getAbsoluteTransformDiff(parent, child);
          parent.appendChild(child);
          child.x = diff.x;
          child.y = diff.y;
        }
        if (current.removed === false) {
          current.remove();
        }
        workingList.splice(i, 1);
        i--;
      }
    }
  }

  // Outline any strokes
  for (let i = 0; i < workingList.length; i++) {
    const current: SceneNode = workingList[i];
    const parent = current.parent;
    if ("outlineStroke" in current) {
      const outlineNode = current.outlineStroke();
      if (outlineNode) {
        parent.appendChild(outlineNode);
        workingList.push(outlineNode);

        // If the remaining shape doesn't have a visible fill, then delete it
        const visibleFills = getVisibleFills(current);
        if (!visibleFills?.length) {
          current.remove();
          workingList.splice(i, 1);
          i--;
        }
      }
    }
  }

  // Use the first valid fill paint data
  for (let i = 0; i < workingList.length; i++) {
    const current: SceneNode = workingList[i];
    let visibleFills: Paint[] = [];
    if (
      fillToUse.length === 0 &&
      current != null &&
      current.type !== "FRAME" &&
      (visibleFills = getVisibleFills(current)).length
    ) {
      fillToUse = visibleFills;
      break;
    }
  }

  // Get an initial flatten so Figma can figure out where to put the parent
  const initialFlatten = figma.flatten(workingList);

  // Clone the flatten so the union can have something meaningful inside of it.
  // Pretty stupid hack, but flattening a union of 1 is essentailly a noop
  // and won't merge the paths together.
  const clonedFlatten = initialFlatten.clone();
  initialFlatten.parent.appendChild(clonedFlatten);
  clonedFlatten.x = initialFlatten.x;
  clonedFlatten.y = initialFlatten.y;
  const union = figma.union(
    [initialFlatten, clonedFlatten],
    initialFlatten.parent
  );

  // Flatten them into a single vector
  const finalFlatten = figma.flatten([union]);
  finalFlatten.fills = fillToUse?.length > 0 ? fillToUse : [DEFAULT_PAINT];
  finalFlatten.name = nameToUse;
  return finalFlatten;
}

async function main() {
  try {
    const outputNode = await deeplyFlatten(figma.currentPage.selection);
    figma.currentPage.selection = [outputNode];
  } catch (e) {
    if (e instanceof Error) {
      figma.notify("⛔️ " + e.message, { error: true });
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
