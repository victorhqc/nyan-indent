'use babel';

/* eslint import/prefer-default-export: 0 */

export const prepareEditor = atom => new Promise((resolve) => {
  atom.workspace.open(`${__dirname}/text-helper.txt`).then((editor) => {
    editor.setText(`
no tab here
  tabulation of 1
    tabulation of 2
      tabulation of 3
        tabulation of 4
          tabulation of 5
`);
    editor.save().then(resolve(editor));
  });
});
