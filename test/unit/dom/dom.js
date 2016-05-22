import create from '../../lib/create';
import hasAllAttributes from '../../lib/has-all-attributes';
import canPatchNativeAccessors from '../../../src/util/can-patch-native-accessors';

describe('skatejs-named-slots dom', function () {
  let host, root, slot, div1, div2, div3, div4, div5;

  function add (elem) {
    this.appendChild(elem || document.createElement('div'));
  }

  function remove(elem) {
    this.removeChild(elem || this.firstChild);
  }

  beforeEach(function () {
    host = document.createElement('div');
    root = host.attachShadow({ mode: 'closed' });
    slot = create('slot');

    // Now it has something to assign nodes to.
    root.appendChild(slot);

    div1 = document.createElement('div');
    div2 = document.createElement('div');
    div3 = document.createElement('div');
    div4 = document.createElement('div');
    div5 = document.createElement('div');

    div1.appendChild(div2);
    div3.appendChild(div4);
    div1.appendChild(div3);
    div1.appendChild(div5);
  });

  describe('methods', function () {
    it('appendChild()', function () {
      const light1 = document.createElement('light-1');
      const light2 = document.createElement('light-2');

      host.appendChild(light1);
      expect(host.childNodes[0]).to.equal(light1, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');

      host.appendChild(light2);
      expect(host.childNodes[1]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(2, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');
      expect(slot.getAssignedNodes()[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');

      expect(div1.childNodes.length).to.equal(3);
      expect(div1.childNodes[0]).to.equal(div2);
      expect(div1.childNodes[1]).to.equal(div3);
      expect(div1.childNodes[2]).to.equal(div5);
      expect(div1.innerHTML).to.equal('<div></div><div><div></div></div><div></div>');

      root.appendChild(div2);
      root.appendChild(div1);

      expect(root.childNodes[0]).to.equal(slot);
      expect(root.childNodes[1]).to.equal(div2);
      expect(root.childNodes[2]).to.equal(div1);
      expect(root.innerHTML).to.equal('<slot></slot><div></div><div><div><div></div></div><div></div></div>');

    });

    it('hasChildNodes', function () {
      expect(host.hasChildNodes()).to.equal(false);
      host.appendChild(document.createElement('div'));
      expect(host.hasChildNodes()).to.equal(true);
      host.removeChild(host.firstChild);
      expect(host.hasChildNodes()).to.equal(false);

      expect(div1.hasChildNodes()).to.equal(true);
      expect(div1.childNodes[0].hasChildNodes()).to.equal(false);
      expect(div1.childNodes[1].hasChildNodes()).to.equal(true);
      expect(div1.childNodes[2].hasChildNodes()).to.equal(false);

      expect(root.hasChildNodes()).to.equal(true);
      root.removeChild(root.firstChild);
      expect(root.hasChildNodes()).to.equal(false);

      root.appendChild(div2);
      expect(root.hasChildNodes()).to.equal(true);

      root.appendChild(div1);
      expect(root.hasChildNodes()).to.equal(true);

      root.appendChild(div5);
      expect(root.hasChildNodes()).to.equal(true);

      root.removeChild(root.childNodes[2]);
      expect(root.hasChildNodes()).to.equal(true);

      root.removeChild(root.childNodes[0]);
      expect(root.hasChildNodes()).to.equal(true);

      root.removeChild(root.firstChild);
      expect(root.hasChildNodes()).to.equal(false);
    });

    it('insertBefore()', function () {
      const light1 = document.createElement('light1');
      const light2 = document.createElement('light2');

      host.insertBefore(light2);
      expect(host.childNodes[0]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');

      host.insertBefore(light1, light2);
      expect(host.childNodes[0]).to.equal(light1, 'internal light dom');
      expect(host.childNodes[1]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(2, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');
      expect(slot.getAssignedNodes()[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');

      let div_local1 = document.createElement('h1');
      let div_local2 = document.createElement('h2');
      let div_local3 = document.createElement('h3');

      div1.insertBefore(div_local1, div1.childNodes[0]);
      div1.insertBefore(div_local2, div1.childNodes[0]);
      div1.insertBefore(div_local3);

      expect(div1.innerHTML).to.equal('<h2></h2><h1></h1><div></div><div><div></div></div><div></div><h3></h3>');
      expect(div1.childNodes[0]).to.equal(div_local2);
      expect(div1.childNodes[1]).to.equal(div_local1);
      expect(div1.childNodes[div1.childNodes.length-1]).to.equal(div_local3);

      root.insertBefore(div_local1, root.childNodes[0]);
      root.insertBefore(div_local2, root.childNodes[0]);
      root.insertBefore(div_local3);

      expect(root.innerHTML).to.equal('<h2></h2><h1></h1><slot></slot><h3></h3>');
      expect(root.childNodes[0]).to.equal(div_local2);
      expect(root.childNodes[1]).to.equal(div_local1);
      expect(root.childNodes[root.childNodes.length-1]).to.equal(div_local3);
    });

    it('removeChild()', function () {
      const light1 = document.createElement('div');
      const light2 = document.createElement('div');

      host.appendChild(light1);
      host.appendChild(light2);

      expect(slot.getAssignedNodes().length).to.equal(2, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');
      expect(slot.getAssignedNodes()[1]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(2, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');
      expect(host.childNodes[1]).to.equal(light2, 'light');

      host.removeChild(light1);
      expect(host.childNodes.length).to.equal(1);
      expect(host.childNodes[0]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');

      host.removeChild(light2);
      expect(host.childNodes.length).to.equal(0);

      expect(slot.getAssignedNodes().length).to.equal(0, 'slot');
      expect(host.childNodes.length).to.equal(0, 'light');

      let div_local1 = document.createElement('h1');
      let div_local2 = document.createElement('h2');
      let div_local3 = document.createElement('h3');
      let div_local4 = document.createElement('h4');
      let div_local5 = document.createElement('h5');

      div1.insertBefore(div_local1, div1.childNodes[0]);
      div1.insertBefore(div_local2);
      div1.childNodes[2].insertBefore(div_local3, div1.childNodes[2].childNodes[0]);
      div1.childNodes[2].insertBefore(div_local4, div1.childNodes[2].childNodes[0]);
      div1.childNodes[2].insertBefore(div_local5);

      expect(div1.childNodes.length).to.equal(5);

      div1.removeChild(div_local1);
      expect(div1.childNodes.length).to.equal(4);

      div1.childNodes[1].removeChild(div1.childNodes[1].childNodes[0]);
      expect(div1.childNodes.length).to.equal(4);
      expect(div1.childNodes[1].childNodes.length).to.equal(3);

      div1.childNodes[1].removeChild(div1.childNodes[1].childNodes[div1.childNodes[1].childNodes.length - 1]);
      expect(div1.childNodes.length).to.equal(4);
      expect(div1.childNodes[1].childNodes.length).to.equal(2);

      div1.removeChild(div1.childNodes[1]);
      expect(div1.childNodes.length).to.equal(3);

      div1.removeChild(div1.firstChild);
      expect(div1.childNodes.length).to.equal(2);

      div1.removeChild(div1.firstChild);
      expect(div1.childNodes.length).to.equal(1);

      div1.removeChild(div1.firstChild);
      expect(div1.childNodes.length).to.equal(0);

      let div_local6 = document.createElement('div');
      let div_local7 = document.createElement('div');
      div_local6.appendChild(div_local7);
      root.insertBefore(div_local1, root.childNodes[0]);
      root.insertBefore(div_local6);
      root.insertBefore(div_local2);

      root.childNodes[2].insertBefore(div_local3, root.childNodes[2].childNodes[0]);
      root.childNodes[2].insertBefore(div_local4, root.childNodes[2].childNodes[0]);
      root.childNodes[2].insertBefore(div_local5);

      expect(root.childNodes.length).to.equal(4);

      root.removeChild(div_local1);
      expect(root.childNodes.length).to.equal(3);

      root.childNodes[1].removeChild(root.childNodes[1].childNodes[0]);
      expect(root.childNodes.length).to.equal(3);
      expect(root.childNodes[1].childNodes.length).to.equal(3);

      root.childNodes[1].removeChild(root.childNodes[1].childNodes[root.childNodes[1].childNodes.length - 1]);
      expect(root.childNodes.length).to.equal(3);
      expect(root.childNodes[1].childNodes.length).to.equal(2);

      root.removeChild(root.childNodes[1]);
      expect(root.childNodes.length).to.equal(2);

      root.removeChild(root.firstChild);
      expect(root.childNodes.length).to.equal(1);

      root.removeChild(root.firstChild);
      expect(root.childNodes.length).to.equal(0);

      expect(root.innerHTML).to.equal('');

      if (canPatchNativeAccessors) {
        expect(root.__innerHTML).to.equal('');
      }
    });

    it('replaceChild()', function () {
      const light1 = document.createElement('div');
      const light2 = document.createElement('div');

      host.appendChild(light1);

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light1, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light1, 'light');

      host.replaceChild(light2, light1);
      expect(host.childNodes.length).to.equal(1);
      expect(host.childNodes[0]).to.equal(light2, 'internal light dom');

      expect(slot.getAssignedNodes().length).to.equal(1, 'slot');
      expect(slot.getAssignedNodes()[0]).to.equal(light2, 'slot');

      expect(host.childNodes.length).to.equal(1, 'light');
      expect(host.childNodes[0]).to.equal(light2, 'light');

      const light3 = document.createElement('div');
      const light4 = document.createElement('div');

      div1.replaceChild(light1, div1.childNodes[0]);
      expect(div1.childNodes[0]).to.equal(light1);

      div1.replaceChild(light2, light1);
      expect(div1.childNodes[0]).to.equal(light2);

      div1.replaceChild(light3, div1.childNodes[2]);
      expect(div1.childNodes[2]).to.equal(light3);

      div1.replaceChild(light4, div1.childNodes[1]);
      expect(div1.childNodes[1]).to.equal(light4);

      expect(div1.innerHTML).to.equal('<div></div><div></div><div></div>');

      if (canPatchNativeAccessors) {
        expect(div1.__innerHTML).to.equal('<div></div><div></div><div></div>');
      }

      let div_local1 = document.createElement('h1');
      let div_local2 = document.createElement('h2');
      let div_local3 = document.createElement('h3');

      root.insertBefore(div_local1, root.childNodes[0]);
      root.insertBefore(div_local3);
      root.childNodes[2].appendChild(div_local2);

      root.replaceChild(light1, root.childNodes[0]);
      expect(root.childNodes[0]).to.equal(light1);

      root.replaceChild(light2, light1);
      expect(root.childNodes[0]).to.equal(light2);

      root.replaceChild(light3, root.childNodes[1]);
      expect(root.childNodes[1]).to.equal(light3);

      root.replaceChild(light4, root.childNodes[2]);
      expect(root.childNodes[2]).to.equal(light4);
    });
  });

  describe('properties', function () {
    describe('innerHTML', function () {
      it('innerHTML', function () {
        expect(host.innerHTML).to.equal('');

        host.innerHTML = '<div slot="custom"></div>';
        expect(host.innerHTML).to.equal('<div slot="custom"></div>');
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(0);

        host.innerHTML = '<div></div>';
        expect(host.innerHTML).to.equal('<div></div>');
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);

        host.innerHTML = '<div></div>';
        expect(host.innerHTML).to.equal('<div></div>');
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);

        host.innerHTML = '<div></div><div></div>';
        expect(host.innerHTML).to.equal('<div></div><div></div>');
        expect(host.childNodes.length).to.equal(2);
        expect(slot.getAssignedNodes().length).to.equal(2);

        host.innerHTML = '<div checked></div>';
        expect(host.innerHTML).to.equal('<div checked></div>');
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);

        host.innerHTML = 'some text';
        expect(host.innerHTML).to.equal('some text');
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);

        host.innerHTML = 'sometext1<div>some text2<div></div></div>some text3';
        expect(host.innerHTML).to.equal('sometext1<div>some text2<div></div></div>some text3');
        expect(host.childNodes.length).to.equal(3);
        expect(slot.getAssignedNodes().length).to.equal(3);

        host.innerHTML = '<div></div>';
        expect(host.innerHTML).to.equal('<div></div>');
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);

        expect(root.innerHTML).to.equal('<slot></slot>');
        host.innerHTML = '';
        expect(root.innerHTML).to.equal('<slot></slot>');

        root.innerHTML = '<div></div>';
        expect(root.innerHTML).to.equal('<div></div>');
        expect(root.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal('<div></div>');

        root.innerHTML = '<div></div><div></div>';
        expect(root.innerHTML).to.equal('<div></div><div></div>');
        expect(root.childNodes.length).to.equal(2);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal('<div></div><div></div>');

        root.innerHTML = 'sometext<div>some text<div></div></div>some text';
        expect(root.innerHTML).to.equal('sometext<div>some text<div></div></div>some text');
        expect(root.childNodes.length).to.equal(3);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal('sometext<div>some text<div></div></div>some text');

        let div = document.createElement('div');
        div.innerHTML = '<div></div>';
        expect(div.innerHTML).to.equal('<div></div>');
        expect(div.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal('<div></div>');

        div.innerHTML = '<div></div><div></div>';
        expect(div.innerHTML).to.equal('<div></div><div></div>');
        expect(div.childNodes.length).to.equal(2);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal('<div></div><div></div>');

        div.innerHTML = 'sometext<div>some text<div></div></div>some text';
        expect(div.innerHTML).to.equal('sometext<div>some text<div></div></div>some text');
        expect(div.childNodes.length).to.equal(3);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal('sometext<div>some text<div></div></div>some text');
      });

      it('innerHTML (with whitespace text nodes)', function () {
        expect(host.innerHTML).to.equal('');
        host.innerHTML = '<div> <button></button> </div>';
        expect(host.innerHTML).to.equal('<div> <button></button> </div>');
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);
        expect(host.childNodes[0].childNodes.length).to.equal(3);

        host.innerHTML = '  <div>  <button></button>  </div>  ';
        expect(host.childNodes.length).to.equal(3);
        expect(slot.getAssignedNodes().length).to.equal(1);   // don't slotting white space nodes https://github.com/skatejs/named-slots/blob/master/src/index.js#L132
        expect(host.childNodes[1].childNodes.length).to.equal(3);

        root.innerHTML = '';
        expect(root.innerHTML).to.equal('');
        root.innerHTML = '<div> <button></button> </div>';
        expect(root.innerHTML).to.equal('<div> <button></button> </div>');
        expect(root.childNodes.length).to.equal(1);
        expect(root.childNodes[0].childNodes.length).to.equal(3);

        root.innerHTML = '  <div>  <button></button>  </div>  ';
        expect(root.childNodes.length).to.equal(3);
        expect(root.childNodes[1].childNodes.length).to.equal(3);

        let div = document.createElement('div');
        div.innerHTML = '';
        expect(div.innerHTML).to.equal('');

        div.innerHTML = '<div> <button></button> </div>';
        expect(div.innerHTML).to.equal('<div> <button></button> </div>');
        expect(div.childNodes.length).to.equal(1);
        expect(div.childNodes[0].childNodes.length).to.equal(3);

        div.innerHTML = '  <div>  <button></button>  </div>  ';
        expect(div.childNodes.length).to.equal(3);
        expect(div.childNodes[1].childNodes.length).to.equal(3);
      });

      it('innerHTML (with [ attributes)', function () {
        expect(host.innerHTML).to.equal('');
        host.innerHTML = '<div [ foo ] ( bar )></div>';
        expect(hasAllAttributes(host.firstChild, ['[', 'foo', ']', '(', 'bar', ')'])).to.equal(true);
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);

        host.innerHTML = '<div [ foo ] ( bar )><div [ foo2 ] ( bar2 )></div></div>';
        expect(hasAllAttributes(host.firstChild, ['[', 'foo', ']', '(', 'bar', ')'])).to.equal(true);
        expect(hasAllAttributes(host.firstChild.firstChild, ['[', 'foo2', ']', '(', 'bar2', ')'])).to.equal(true);

        root.innerHTML = '';
        expect(root.innerHTML).to.equal('');
        root.innerHTML = '<div [ foo ] ( bar )></div>';
        expect(hasAllAttributes(root.firstChild, ['[', 'foo', ']', '(', 'bar', ')'])).to.equal(true);
        expect(root.childNodes.length).to.equal(1);

        root.innerHTML = '<div [ foo ] ( bar )><div [ foo2 ] ( bar2 )></div></div>';
        expect(hasAllAttributes(root.firstChild, ['[', 'foo', ']', '(', 'bar', ')'])).to.equal(true);
        expect(hasAllAttributes(root.firstChild.firstChild, ['[', 'foo2', ']', '(', 'bar2', ')'])).to.equal(true);

        let div = document.createElement('div');
        div.innerHTML = '';
        expect(div.innerHTML).to.equal('');
        div.innerHTML = '<div [ foo ] ( bar )></div>';
        expect(hasAllAttributes(div.firstChild, ['[', 'foo', ']', '(', 'bar', ')'])).to.equal(true);
        expect(div.childNodes.length).to.equal(1);

        div.innerHTML = '<div [ foo ] ( bar )><div [ foo2 ] ( bar2 )></div></div>';
        expect(hasAllAttributes(div.firstChild, ['[', 'foo', ']', '(', 'bar', ')'])).to.equal(true);
        expect(hasAllAttributes(div.firstChild.firstChild, ['[', 'foo2', ']', '(', 'bar2', ')'])).to.equal(true);
      });

      it('created text nodes get escaped when being appended', function () {
        expect(host.innerHTML).to.equal('');
        const text = document.createTextNode('<u>foo & bar</u>');
        const textCont = '&lt;u&gt;foo &amp; bar&lt;/u&gt;';

        host.appendChild(text);
        expect(host.innerHTML).to.equal(textCont);
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);

        root.innerHTML = '';
        expect(root.innerHTML).to.equal('');
        root.appendChild(text);
        expect(root.innerHTML).to.equal(textCont);
        expect(root.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal(textCont);

        const div = document.createElement('div');
        div.appendChild(text);
        expect(div.innerHTML).to.equal(textCont);
        expect(div.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal(textCont);
      });

      it('innerHTML handles non text / html nodes', function () {
        expect(host.innerHTML).to.equal('');
        const processingInstruction = '<?xml-stylesheet href="mycss.css" type="text/css"?>';
        const processingInstructionsAfterInnerHtml = '<!--?xml-stylesheet href="mycss.css" type="text/css"?-->';
        const comment = '<!-- comment -->';

        host.innerHTML = processingInstruction;
        expect([processingInstruction, processingInstructionsAfterInnerHtml].indexOf(host.innerHTML)).to.be.above(-1);
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);

        host.innerHTML = comment;
        expect(host.innerHTML).to.equal(comment);
        expect(host.childNodes.length).to.equal(1);
        expect(slot.getAssignedNodes().length).to.equal(1);

        root.innerHTML = processingInstruction;
        expect([processingInstruction, processingInstructionsAfterInnerHtml].indexOf(root.innerHTML)).to.be.above(-1);
        expect(root.childNodes.length).to.equal(3);
        canPatchNativeAccessors && expect([processingInstruction, processingInstructionsAfterInnerHtml].indexOf(root.__innerHTML)).to.be.above(-1);

        root.innerHTML = comment;
        expect(root.innerHTML).to.equal(comment);
        expect(root.childNodes.length).to.equal(3);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal(comment);

        const div = document.createElement('div');
        div.innerHTML = processingInstruction;
        expect([processingInstruction, processingInstructionsAfterInnerHtml].indexOf(div.innerHTML)).to.be.above(-1);
        canPatchNativeAccessors && expect([processingInstruction, processingInstructionsAfterInnerHtml].indexOf(div.__innerHTML)).to.be.above(-1);

        div.innerHTML = comment;
        expect(div.innerHTML).to.equal(comment);
        expect(div.childNodes.length).to.equal(3);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal(comment);

      });

      it('setting to \'\' does not affect innerHTML', function () {
        expect(host.innerHTML).to.equal('');
        host.innerHTML = '';
        expect(host.childNodes.length).to.equal(0);
      });
    });

    describe('textContent', function () {
      it('sets and gets correctly', function () {
        expect(host.textContent).to.equal('');
        host.textContent = '<test />';
        expect(host.textContent).to.equal('<test />');
        expect(host.innerHTML).to.equal('&lt;test /&gt;');
        expect(host.childNodes.length).to.equal(1);
      //  expect(slot.getAssignedNodes().length).to.equal(1);
        // Ensure value was escaped.
        expect(host.firstChild.nodeType).to.equal(3);

        host.textContent = '<testtest />';
        expect(host.textContent).to.equal('<testtest />');
        expect(host.innerHTML).to.equal('&lt;testtest /&gt;');
        expect(host.childNodes.length).to.equal(1);
       // expect(slot.getAssignedNodes().length).to.equal(1);

        host.innerHTML = "<div>sometest <div>another text</div></div>and outside";
        expect(host.textContent).to.equal('sometest another textand outside');

        expect(root.textContent).to.equal('');
        root.textContent = '<test />';
        expect(root.textContent).to.equal('<test />');
        expect(root.firstChild.nodeType).to.equal(3);
        expect(root.innerHTML).to.equal('&lt;test /&gt;');
        expect(root.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal('&lt;test /&gt;');

        root.textContent = '<testtest />';
        expect(root.textContent).to.equal('<testtest />');
        expect(root.firstChild.nodeType).to.equal(3);
        expect(root.innerHTML).to.equal('&lt;testtest /&gt;');
        expect(root.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal('&lt;testtest /&gt;');

        root.innerHTML = "<div>sometest <div>another text</div></div>and outside";
        expect(root.textContent).to.equal('sometest another textand outside');

        const div = document.createElement('div');
        expect(div.textContent).to.equal('');
        div.textContent = '<test />';
        expect(div.textContent).to.equal('<test />');
        expect(div.firstChild.nodeType).to.equal(3);
        expect(div.innerHTML).to.equal('&lt;test /&gt;');
        expect(div.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal('&lt;test /&gt;');

        div.textContent = '<testtest />';
        expect(div.textContent).to.equal('<testtest />');
        expect(div.firstChild.nodeType).to.equal(3);
        expect(div.innerHTML).to.equal('&lt;testtest /&gt;');
        expect(div.childNodes.length).to.equal(1);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal('&lt;testtest /&gt;');

        div.innerHTML = "<div>sometest <div>another text</div></div>and outside";
        expect(div.textContent).to.equal('sometest another textand outside');
      });

      it('does not return comments', function () {
        expect(host.textContent).to.equal('');
        host.innerHTML = '<!-- comment -->';
        expect(host.textContent).to.equal('');

        root.innerHTML = '<!-- comment -->';
        expect(root.textContent).to.equal('');

        const div = document.createElement('div');
        div.innerHTML = '<!-- comment -->';
        expect(div.textContent).to.equal('');
      });

      it('setting to \'\' does not affect textContent', function () {
        expect(host.textContent).to.equal('');
        host.textContent = '';
        expect(host.childNodes.length).to.equal(0);
        expect(slot.getAssignedNodes().length).to.equal(0);

        root.textContent = '';
        expect(root.innerHTML).to.equal('');
        expect(root.childNodes.length).to.equal(0);
        canPatchNativeAccessors && expect(root.__innerHTML).to.equal('');

        const div = document.createElement('div');
        div.textContent = '';
        expect(div.innerHTML).to.equal('');
        expect(div.childNodes.length).to.equal(0);
        canPatchNativeAccessors && expect(div.__innerHTML).to.equal('');
      });
    });

    it('childElementCount', function () {
      testChildElemCount(host);
      root.innerHTML = '';
      testChildElemCount(root);
      testChildElemCount(document.createElement('div'));

      function testChildElemCount(elem) {
        expect(elem.childElementCount).to.equal(0);
        add.call(elem);
        expect(elem.childElementCount).to.equal(1);
        remove.call(elem);
        expect(elem.childElementCount).to.equal(0);

        add.call(elem);
        expect(elem.childElementCount).to.equal(1);
        add.call(elem);
        expect(elem.childElementCount).to.equal(2);
        add.call(elem);
        expect(elem.childElementCount).to.equal(3);
        remove.call(elem);
        expect(elem.childElementCount).to.equal(2);
        remove.call(elem);
        expect(elem.childElementCount).to.equal(1);
        remove.call(elem);
        expect(elem.childElementCount).to.equal(0);
      }
    });

    it('childNodes', function () {
      testChildNodes(host);
      root.innerHTML = '';
      testChildNodes(root);
      testChildNodes(document.createElement('div'));

      function testChildNodes(elem) {
        //expect(elem.childNodes).to.be.an('array');
        expect(elem.childNodes.item).to.be.a('function');
        expect(elem.childNodes.length).to.equal(0);
        add.call(elem);
        expect(elem.childNodes.length).to.equal(1);
        remove.call(elem);
        expect(elem.childNodes.length).to.equal(0);

        add.call(elem);
        expect(elem.childNodes.length).to.equal(1);
        add.call(elem);
        expect(elem.childNodes.length).to.equal(2);
        add.call(elem);
        expect(elem.childNodes.length).to.equal(3);
        remove.call(elem);
        expect(elem.childNodes.length).to.equal(2);
        remove.call(elem);
        expect(elem.childNodes.length).to.equal(1);
        remove.call(elem);
        expect(elem.childNodes.length).to.equal(0);

        elem.innerHTML = "<div>text</div> some text <div><div></div></div>      ";
        expect(elem.childNodes.length).to.equal(4);
      }
    });

    it('children', function () {
      testChildren(host);
      root.innerHTML = '';
      testChildren(root);
      testChildren(document.createElement('div'));

      function testChildren(elem) {
        expect(elem.children.length).to.equal(0);
        add.call(elem);
        expect(elem.children.length).to.equal(1);
        remove.call(elem);
        expect(elem.children.length).to.equal(0);
        add.call(elem);
        add.call(elem, document.createTextNode('123'));
        expect(elem.children.length).to.equal(1);
        add.call(elem);
        add.call(elem, document.createTextNode('123'));
        expect(elem.children.length).to.equal(2);
        add.call(elem, document.createTextNode(''));
        expect(elem.children.length).to.equal(2);

        remove.call(elem);
        expect(elem.children.length).to.equal(1);
        remove.call(elem);
        expect(elem.children.length).to.equal(1);
        remove.call(elem);
        remove.call(elem);
        expect(elem.children.length).to.equal(0);
      }
    });

    it.only('firstChild', function () {
      expect(host.firstChild).to.equal(null);
      add.call(host);
      expect(host.firstChild).to.not.equal(null);
      expect(host.firstChild.tagName).to.equal('DIV');
      remove.call(host);
      expect(host.firstChild).to.equal(null);
    });

    it('firstElementChild', function () {
      expect(host.firstChild).to.equal(null);
      add.call(host);
      expect(host.firstChild).to.not.equal(null);
      expect(host.firstChild.tagName).to.equal('DIV');
      remove.call(host);
      expect(host.firstChild).to.equal(null);
    });

    it('lastChild', function () {
      expect(host.lastChild).to.equal(null);
      add.call(host);
      expect(host.lastChild).to.not.equal(null);
      expect(host.lastChild.tagName).to.equal('DIV');
      remove.call(host);
      expect(host.lastChild).to.equal(null);
    });

    it('lastElementChild', function () {
      expect(host.lastElementChild).to.equal(null);
      add.call(host);
      expect(host.lastElementChild).to.not.equal(null);
      expect(host.lastElementChild.tagName).to.equal('DIV');
      remove.call(host);
      expect(host.lastElementChild).to.equal(null);
    });

    it('outerHTML', function () {
      expect(host.outerHTML).to.equal('<div></div>');
      host.innerHTML = '<div slot="custom"></div>';
      expect(host.outerHTML).to.equal('<div><div slot="custom"></div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(0);

      host.innerHTML = '<div></div>';
      expect(host.outerHTML).to.equal('<div><div></div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(1);

      host.innerHTML = '<div></div>';
      expect(host.outerHTML).to.equal('<div><div></div></div>');
      expect(host.childNodes.length).to.equal(1);
      expect(slot.getAssignedNodes().length).to.equal(1);
    });
  });

  describe('DocumentFragment', function () {
    it('should report the corect parent node for nested nodes', function () {
      const frag = document.createDocumentFragment();
      const elem = document.createElement('div');
      frag.appendChild(elem);
      expect(elem.parentNode).to.equal(frag);
    });
  });
});
