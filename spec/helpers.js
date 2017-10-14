'use babel';

import filter from 'lodash/filter';

export const saveEditor = editor => new Promise(resolve =>
  editor.save().then(resolve(editor)),
);

export const openTestFile = atom => atom.workspace.open(`${__dirname}/text-helper.txt`);

export const activatePackage = atom => atom.packages.activatePackage('nyan-indent');

export const findDecorations = editor => editor.getDecorations({
  type: 'text',
  class: 'nyan-indent',
});

export const getColors = atom => atom.config.get('nyan-indent.colors');

export const findDecorationByColor = (decorations, color) =>
  filter(decorations, decoration => decoration.properties.style.backgroundColor === color);
