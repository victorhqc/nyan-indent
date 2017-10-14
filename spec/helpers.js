'use babel';

export const setText = (editor, text) => new Promise((resolve) => {
  editor.setText(text);
  editor.save().then(resolve(editor));
});

export const openTestFile = atom => atom.workspace.open(`${__dirname}/text-helper.txt`);

export const prepareEditor = (atom, text) =>
  openTestFile(atom)
    .then(editor => setText(editor, text));

export const findDecorations = editor => editor.getDecorations({
  type: 'text',
  class: 'nyan-indent',
});

export const getColors = atom => atom.config.get('nyan-indent.colors');

export const activatePackage = atom => atom.packages.activatePackage('nyan-indent');
