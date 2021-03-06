import { shadowDomV0 } from '../../../src/util/support';

describe('dom: outerHTML', () => {
  // This is so that it goes through any possible innerHTML massaging. For
  // example, this is necessary when upgrading native v0 to behave like v1.
  function html(str) {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.innerHTML;
  }

  function compare(src, dst) {
    expect(src.outerHTML).to.equal(shadowDomV0 ? html(dst) : dst);
  }

  function runTests(type) {
    describe(`${type}: `, () => {
      let host;
      let root;
      let slot;
      let div;
      let elem;

      beforeEach(() => {
        host = document.createElement('div');
        root = host.attachShadow({ mode: 'open' });
        slot = document.createElement('slot');

        root.appendChild(slot);

        div = document.createElement('div');

        switch (type) {
        case 'div':
          elem = div;
          break;
        case 'slot':
          elem = slot;
          break;
        default:
          elem = host;
        }
      });

      it('should get a proper value from a node with one element child', () => {
        elem.innerHTML = '<test></test>';
        if (type === 'host' || type === 'div') {
          compare(elem, '<div><test></test></div>');
        } else if (type === 'slot') {
          compare(elem, '<slot><test></test></slot>');
        }
      });

      it('should get a proper value from a node with one text child', () => {
        elem.innerHTML = 'text';
        if (type === 'host' || type === 'div') {
          compare(elem, '<div>text</div>');
        } else if (type === 'slot') {
          compare(elem, '<slot>text</slot>');
        }
      });

      it('should get a proper value from a node with one comment child', () => {
        elem.innerHTML = '<!--comment-->';
        if (type === 'host' || type === 'div') {
          compare(elem, '<div><!--comment--></div>');
        } else if (type === 'slot') {
          compare(elem, '<slot><!--comment--></slot>');
        }
      });

      it('should get a proper value from a node with two or more children', () => {
        elem.innerHTML = '<test></test><test2>text</test2><!--comment-->';
        if (type === 'host' || type === 'div') {
          compare(elem, '<div><test></test><test2>text</test2><!--comment--></div>');
        } else if (type === 'slot') {
          compare(elem, '<slot><test></test><test2>text</test2><!--comment--></slot>');
        }
      });

      it('should set a proper value', () => {
        elem.innerHTML = '<div1><div2></div2><div3></div3></div1>';
        elem.childNodes[0].childNodes[0].outerHTML = '<div4></div4>';
        expect(elem.innerHTML).to.equal('<div1><div4></div4><div3></div3></div1>');

        elem.innerHTML = '<div1><div2></div2><div3></div3></div1>';
        elem.childNodes[0].outerHTML = '<div4></div4>';
        expect(elem.innerHTML).to.equal('<div4></div4>');
      });
    });
  }

  runTests('div');
  runTests('slot');
  runTests('host');
});
