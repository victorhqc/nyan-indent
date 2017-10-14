'use babel';

import filter from 'lodash/filter';
import { prepareEditor } from './helpers';
import NyanIndent from '../lib/nyan-indent';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.


const findDecorationByColor = (decorations, color) =>
  filter(decorations, decoration => decoration.properties.style.backgroundColor === color);

describe('NyanIndent', () => {
  it('Should paint on render', () =>
    prepareEditor(atom).then((editor) => {
      atom.packages.activatePackage('nyan-indent').then(() => {
        const decorations = editor.getDecorations({
          type: 'text',
          class: 'nyan-indent',
        });
        expect(decorations.length).toBe(15);

        const colors = atom.config.get('nyan-indent.colors');

        const firstTabDecorations = findDecorationByColor(decorations, colors[0]);
        expect(
          firstTabDecorations.length,
        ).toBe(5);

        const secondTabDecorations = findDecorationByColor(decorations, colors[1]);
        expect(
          secondTabDecorations.length,
        ).toBe(4);

        const thirdTabDecorations = findDecorationByColor(decorations, colors[2]);
        expect(
          thirdTabDecorations.length,
        ).toBe(3);

        const fourthTabDecorations = findDecorationByColor(decorations, colors[3]);
        expect(
          fourthTabDecorations.length,
        ).toBe(2);

        const fifthTabDecorations = findDecorationByColor(decorations, colors[4]);
        expect(
          fifthTabDecorations.length,
        ).toBe(1);
      });
    }),
  );
});
