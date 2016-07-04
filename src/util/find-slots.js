import isSlotNode from './is-slot-node';

export default function findSlots(root, slots = []) {
  const { childNodes } = root;

  if (!childNodes || root.nodeType !== Node.ELEMENT_NODE) {
    return slots;
  }

  const { length } = childNodes;

  for (let a = 0; a < length; a++) {
    const childNode = childNodes[a];

    if (isSlotNode(childNode)) {
      slots.push(childNode);
    }
    findSlots(childNode, slots);
  }

  return slots;
}
