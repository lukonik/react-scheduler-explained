/** Main Node Object */
type Node = {
  id: number;
  sortIndex: number;
};

/** Array representation of a min heap */
type Heap<T extends Node> = Array<T>;

/**
 * Inserts a new node into the min heap.
 * It adds the node to the end of the array and then moves it up
 * the tree to its correct position to maintain the min-heap property.
 * * @param heap - The heap array.
 * @param node - The node to insert.
 */
export function push<T extends Node>(heap: Heap<T>, node: T): void {
  const index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}

/** * Retrieves the node with the lowest sort order without removing it.
 * In a min heap, this is always the first element.
 * * @param heap - The heap array.
 * @returns The smallest node, or null if the heap is empty.
 */
export function peek<T extends Node>(heap: Heap<T>): T | null {
  return heap.length === 0 ? null : heap[0];
}

/**
 * Removes and returns the node with the lowest sort order (the root).
 * To maintain the tree shape, it takes the last element, places it at the root,
 * and then moves it down the tree to its correct position.
 * * @param heap - The heap array.
 * @returns The removed smallest node, or null if the heap is empty.
 */
export function pop<T extends Node>(heap: Heap<T>): T | null {
  if (heap.length === 0) {
    return null;
  }

  const first = heap[0];
  const last = heap.pop();

  // If the heap had more than one element, place the former last element
  // at the root and sift it down to restore the min-heap property.
  if (last !== first) {
    // @ts-ignore
    heap[0] = last;
    // @ts-ignore
    siftDown(heap, last, 0);
  }

  return first;
}

/**
 * Moves a node up the tree as long as it is strictly smaller than its parent.
 * This is used after inserting a new element at the bottom of the heap.
 * * @param heap - The heap array.
 * @param node - The node to sift up.
 * @param i - The starting index of the node.
 */
function siftUp<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i;

  while (index > 0) {
    // Bitwise shift `>>> 1` is a fast integer division by 2
    // equivalent to Math.floor((index - 1) / 2)
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];

    if (compare(parent, node) > 0) {
      // The parent is larger. Swap positions.
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      // The parent is smaller or equal. The node is in the right place; exit.
      return;
    }
  }
}

/**
 * Moves a node down the tree by swapping it with its smallest child
 * as long as the node is strictly larger than at least one of its children.
 * This is used after extracting the root node to restore the heap.
 * * @param heap - The heap array.
 * @param node - The node to sift down.
 * @param i - The starting index of the node (usually 0).
 */
function siftDown<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i;
  const length = heap.length;
  const halfLength = length >>> 1;

  // We only need to check nodes that have at least one child.
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];

    // If the left child is smaller than the current node
    if (compare(left, node) < 0) {
      // Check if the right child exists and is even smaller than the left child
      if (rightIndex < length && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // Otherwise, swap with the left child
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    }
    // Left child is not smaller, but right child might be
    else if (rightIndex < length && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    }
    // Current node is smaller than both children. The node is in the right place; exit.
    else {
      return;
    }
  }
}

/** * Compares two nodes to determine their priority in the heap.
 * A negative result means `a` should be placed higher (closer to the root) than `b`.
 * * @param a - The first node to compare.
 * @param b - The second node to compare.
 * @returns A negative number if `a` is smaller, positive if `b` is smaller, or 0 if equal.
 */
function compare(a: Node, b: Node) {
  // Compare sort index first. If there's a tie, fall back to comparing the task id.
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
