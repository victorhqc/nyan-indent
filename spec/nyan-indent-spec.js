'use babel';

import {
  openTestFile,
  findDecorations,
  getColors,
  activatePackage,
  findDecorationByColor,
  togglePackage,
} from './helpers';

const indentedText = `
no tab here
  tabulation of 1
    tabulation of 2
      tabulation of 3
        tabulation of 4
          tabulation of 5
`;

const notIndentedText = `
no tab here
tabulation of 1
tabulation of 2
tabulation of 3
tabulation of 4
tabulation of 5
`;

const indentedLine = '        indentation of 4';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('NyanIndent', () => {
  beforeEach(() => {
    waitsForPromise(() => openTestFile(atom));

    waitsForPromise(() => activatePackage(atom));
  });

  it('Should activate package', () => {
    expect(atom.packages.isPackageActive('nyan-indent')).toBeTruthy();
  });

  it('Should update paint in multiple lines', () => {
    const editor = atom.workspace.getActiveTextEditor();

    editor.setText(indentedText);

    const decorations = findDecorations(editor);
    expect(decorations.length).toBe(15);

    const colors = getColors(atom);

    // There should be 5 red "indentations" from top to bottom
    const firstTabDecorations = findDecorationByColor(decorations, colors[0]);
    expect(
      firstTabDecorations.length,
    ).toBe(5);

    // There should be 4 yellow "indentations" from top to bottom
    const secondTabDecorations = findDecorationByColor(decorations, colors[1]);
    expect(
      secondTabDecorations.length,
    ).toBe(4);

    // There should be 3 green "indentations" from top to bottom
    const thirdTabDecorations = findDecorationByColor(decorations, colors[2]);
    expect(
      thirdTabDecorations.length,
    ).toBe(3);

    // There should be 2 blue "indentations" from top to bottom
    const fourthTabDecorations = findDecorationByColor(decorations, colors[3]);
    expect(
      fourthTabDecorations.length,
    ).toBe(2);

    // There should be 1 purple "indentation" from top to bottom
    const fifthTabDecorations = findDecorationByColor(decorations, colors[4]);
    expect(
      fifthTabDecorations.length,
    ).toBe(1);
  });

  it('Should update when editing current line', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(notIndentedText);

    // Adds 2 tabulations
    const textToInsert = '    tabulation of 3';
    editor.setTextInBufferRange([[4, 0], [4, 21]], textToInsert);
    const firstDecorations = findDecorations(editor);

    expect(firstDecorations.length).toBe(2);

    // Adds another tabulation in another line
    const textToInsert2 = '  tabulation of 4';
    editor.setTextInBufferRange([[5, 0], [5, 21]], textToInsert2);
    const secondDecorations = findDecorations(editor);

    expect(secondDecorations.length).toBe(3);

    const colors = getColors(atom);

    // There should be 2 first colors
    const firstTabDecorations = findDecorationByColor(secondDecorations, colors[0]);
    expect(
      firstTabDecorations.length,
    ).toBe(2);

    // There should be 1 second color
    const secondTabDecorations = findDecorationByColor(secondDecorations, colors[1]);
    expect(
      secondTabDecorations.length,
    ).toBe(1);
  });

  it('Should remove all paint toggling the package', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    expect(findDecorations(editor).length).toBe(15);

    // Toggles off
    togglePackage(atom);

    expect(findDecorations(editor).length).toBe(0);
  });

  it('Should repaint after toggling package', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    expect(findDecorations(editor).length).toBe(15);

    // Toggles off
    togglePackage(atom);
    // Toggles on
    togglePackage(atom);

    expect(findDecorations(editor).length).toBe(15);
  });

  it('Shoud not paint text once package is toggled off', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(notIndentedText);

    // Toggles off
    togglePackage(atom);

    // Adds 2 tabulations
    const textToInsert = '    tabulation of 3';
    editor.setTextInBufferRange([[4, 0], [4, 21]], textToInsert);
    const decorations = findDecorations(editor);

    expect(decorations.length).toBe(0);
  });

  it('Should paint text once package is toggled back on', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(notIndentedText);

    // Toggles off
    togglePackage(atom);
    // Toggles on
    togglePackage(atom);

    // Adds 2 tabulations
    const textToInsert = '    tabulation of 3';
    editor.setTextInBufferRange([[4, 0], [4, 21]], textToInsert);
    const decorations = findDecorations(editor);

    expect(decorations.length).toBe(2);
  });

  it('Should set correct paint when removing indentation from a single line', () => {
    const editor = atom.workspace.getActiveTextEditor();

    editor.setText(indentedLine);
    expect(findDecorations(editor).length).toBe(4);

    const indentedLine2 = '      indentation of 3';
    editor.setTextInBufferRange([[0, 0], [0, 24]], indentedLine2);
    expect(findDecorations(editor).length).toBe(3);

    const indentedLine3 = '    indentation of 2';
    editor.setTextInBufferRange([[0, 0], [0, 22]], indentedLine3);
    expect(findDecorations(editor).length).toBe(2);
  });

  it('Should change painting when configuration colors change', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);

    const newColors = [
      '#ff7f7f',
      '#ffe481',
      '#d2ff8b',
      '#a5d1ff',
      '#e39cff',
    ];
    atom.config.set('nyan-indent.colors', newColors);
    const decorations = findDecorations(editor);
    expect(decorations.length).toBe(15);

    // There should be 5 red "indentations" from top to bottom
    const firstTabDecorations = findDecorationByColor(decorations, newColors[0]);
    expect(
      firstTabDecorations.length,
    ).toBe(5);

    // There should be 4 yellow "indentations" from top to bottom
    const secondTabDecorations = findDecorationByColor(decorations, newColors[1]);
    expect(
      secondTabDecorations.length,
    ).toBe(4);

    // There should be 3 green "indentations" from top to bottom
    const thirdTabDecorations = findDecorationByColor(decorations, newColors[2]);
    expect(
      thirdTabDecorations.length,
    ).toBe(3);

    // There should be 2 blue "indentations" from top to bottom
    const fourthTabDecorations = findDecorationByColor(decorations, newColors[3]);
    expect(
      fourthTabDecorations.length,
    ).toBe(2);

    // There should be 1 purple "indentation" from top to bottom
    const fifthTabDecorations = findDecorationByColor(decorations, newColors[4]);
    expect(
      fifthTabDecorations.length,
    ).toBe(1);
  });

  it('Should use new colors after configuration colors changed', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(notIndentedText);
    const originalColors = getColors(atom);

    const newColors = [
      '#ff7f7f',
      '#ffe481',
      '#d2ff8b',
      '#a5d1ff',
      '#e39cff',
    ];
    atom.config.set('nyan-indent.colors', newColors);

    const textToInsert = '    tabulation of 4';
    editor.setTextInBufferRange([[5, 0], [5, 21]], textToInsert);
    const decorations = findDecorations(editor);

    expect(decorations.length).toBe(2);
    expect(findDecorationByColor(decorations, newColors[0]).length).toBe(1);
    expect(findDecorationByColor(decorations, originalColors[0]).length).toBe(0);

    expect(findDecorationByColor(decorations, newColors[1]).length).toBe(1);
    expect(findDecorationByColor(decorations, originalColors[1]).length).toBe(0);

    const newColorsAgain = [
      '#b3ecec',
      '#89ecda',
      '#43e8d8',
      '#40e0d0',
      '#3bd6c6',
    ];
    atom.config.set('nyan-indent.colors', newColorsAgain);

    const textToInsert2 = '        tabulation of 4';
    editor.setTextInBufferRange([[5, 0], [5, 21]], textToInsert2);
    const secondDecorations = findDecorations(editor);

    expect(decorations.length).toBe(2);
    expect(findDecorationByColor(secondDecorations, newColorsAgain[0]).length).toBe(1);
    expect(findDecorationByColor(secondDecorations, newColors[0]).length).toBe(0);

    expect(findDecorationByColor(secondDecorations, newColorsAgain[1]).length).toBe(1);
    expect(findDecorationByColor(secondDecorations, newColors[1]).length).toBe(0);

    expect(findDecorationByColor(secondDecorations, newColorsAgain[2]).length).toBe(1);
    expect(findDecorationByColor(secondDecorations, newColors[2]).length).toBe(0);

  });
});
