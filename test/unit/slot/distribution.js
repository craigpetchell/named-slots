import '../../../src/index';
import create from '../../lib/create';

describe('slot/distribution', () => {
  let slot;
  let host;
  let root;
  let parent;

  beforeEach(() => {
    host = document.createElement('div');
    root = host.attachShadow({ mode: 'closed' });
    parent = create('div');
    slot = create('slot');

    root.appendChild(parent);
    parent.appendChild(slot);
  });

  it('distributes to the inner slot', () => {
    const light = document.createElement('light');
    host.appendChild(light);
    expect(host.childNodes[0]).to.equal(light, 'internal light dom');

    expect(slot.assignedNodes().length).to.equal(1, 'slot');
    expect(slot.assignedNodes()[0]).to.equal(light, 'slot');

    const lightText = document.createTextNode('text');
    host.appendChild(lightText);
    expect(host.childNodes[1]).to.equal(lightText);

    expect(slot.assignedNodes().length).to.equal(2);
    expect(slot.assignedNodes()[0]).to.equal(light, 'slot');
    expect(slot.assignedNodes()[1]).to.equal(lightText);

    const lightComment = document.createComment('text');
    host.appendChild(lightComment);
    expect(host.childNodes[2]).to.equal(lightComment);

    expect(slot.assignedNodes().length).to.equal(2);
    expect(slot.assignedNodes()[0]).to.equal(light, 'slot');
    expect(slot.assignedNodes()[1]).to.equal(lightText);
  });

  it('should remove child elements when distributing a document fragment', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');

    const frag = document.createDocumentFragment();
    frag.appendChild(div1);
    frag.appendChild(div2);

    host.appendChild(frag);
    expect(frag.childNodes.length).to.equal(0);
  });

  describe('changing slot name with more than two children', () => {
    it('does not re-order slotted elements', () => {
      const child1 = document.createElement('child1');
      const child2 = document.createElement('child2');
      const child3 = document.createElement('child3');
      const childWithSlotAttribute = document.createElement('child4');
      childWithSlotAttribute.setAttribute('slot', 'foo');

      host.appendChild(child1);
      host.appendChild(child2);
      host.appendChild(child3);
      host.appendChild(childWithSlotAttribute);

      expect(slot.assignedNodes().length).to.equal(3, 'the three children are slotted, and the child with a name remains unslotted');

      slot.name = 'foo';

      expect(slot.assignedNodes().length).to.equal(1, 'the child with the slot attribute becomes the only slotted element');

      expect(host.childNodes[0]).to.equal(child1, 'the dom order of child 1 remains the same');
      expect(host.childNodes[1]).to.equal(child2, 'the dom order of child 2 remains the same');
      expect(host.childNodes[2]).to.equal(child3, 'the dom order of child 3 remains the same');
      expect(slot.assignedNodes()[0]).to.equal(childWithSlotAttribute, 'the fourth child becomes slotted');
    });
  });

  describe('changing slot name causes re-slotting', () => {
    beforeEach(() => {
      const light = document.createElement('light');
      host.appendChild(light);
      expect(slot.assignedNodes().length).to.equal(1, 'starts with one assigned node');
    });

    it('with a property', () => {
      slot.name = 'foo';
      expect(slot.assignedNodes().length).to.equal(0);
    });

    it('with an attribute', () => {
      slot.setAttribute('name', 'foo');
      expect(slot.assignedNodes().length).to.equal(0);
    });
  });

  describe('changing element slot causes re-slotting', () => {
    let light;

    beforeEach(() => {
      light = document.createElement('light');
      host.appendChild(light);
      expect(slot.assignedNodes().length).to.equal(1, 'starts with one assigned nodes');
    });

    it('with a property', () => {
      light.slot = 'foo';
      expect(slot.assignedNodes().length).to.equal(0);
    });

    it('with an attribute', () => {
      light.setAttribute('slot', 'foo');
      expect(slot.assignedNodes().length).to.equal(0);
    });
  });

  describe('distributes to the slot that is owned by the current shadow root, not slots of descendant shadow roots', () => {
    it('for default slots', () => {
      const host1 = document.createElement('host-1');
      const host2 = document.createElement('host-2');
      const slot1 = document.createElement('slot');
      const slot2 = document.createElement('slot');
      const test = document.createTextNode('test');

      // Host2 must be set up and then added to host1's shadow root so that
      // host1 tries to slot the test content into host2's slot2 instead of
      // host1's slot1. Order of setup doesn't matter here.

      host1.appendChild(test);
      host1.attachShadow({ mode: 'open' });
      host1.shadowRoot.appendChild(host2);

      host2.appendChild(slot1);
      host2.attachShadow({ mode: 'open' });
      host2.shadowRoot.appendChild(slot2);

      expect(slot1.assignedNodes().length).to.equal(1);
      expect(slot1.assignedNodes()[0]).to.equal(test);
      expect(slot2.assignedNodes().length).to.equal(1);
      expect(slot2.assignedNodes()[0]).to.equal(slot1);
    });

    it('for named slots', () => {
      const host1 = document.createElement('host1');
      const host2 = document.createElement('host2');
      const slot1 = document.createElement('slot');
      const slot2 = document.createElement('slot');
      const test = document.createElement('test');

      test.setAttribute('slot', 'test');
      slot1.setAttribute('slot', 'test');

      slot1.setAttribute('name', 'test');
      slot2.setAttribute('name', 'test');

      // Host2 must be set up and then added to host1's shadow root so that
      // host1 tries to slot the test content into host2's slot2 instead of
      // host1's slot1.
      host2.appendChild(slot1);
      host2.attachShadow({ mode: 'open' });
      host2.shadowRoot.appendChild(slot2);

      host1.appendChild(test);
      host1.attachShadow({ mode: 'open' });
      host1.shadowRoot.appendChild(host2);

      expect(slot1.assignedNodes().length).to.equal(1);
      expect(slot1.assignedNodes()[0]).to.equal(test);
      expect(slot2.assignedNodes().length).to.equal(1);
      expect(slot2.assignedNodes()[0]).to.equal(slot1);
    });
  });
});
