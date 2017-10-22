'use babel';

import filter from 'lodash/filter';
import reduce from 'lodash/reduce';

export const saveEditor = editor => new Promise(resolve =>
  editor.save().then(resolve(editor)),
);

export const openTestFile = atom => atom.workspace.open(`${__dirname}/text-helper.txt`);

export const activatePackage = atom => atom.packages.activatePackage('nyan-indent');

export const findDecorations = (editor) => {
  const decorations = editor.getDecorations({
    type: 'text',
  });

  return filter(
    decorations,
    decoration => decoration.getProperties().class.match(new RegExp('nyan-indent')) !== null,
  );
};

export const getColor = atom => atom.config.get('nyan-indent.color');

export const getPreferences = (atom) => {
  const chosenColor = atom.config.get('nyan-indent.color');
  const opacity = atom.config.get('nyan-indent.opacity');
  const useCustomColors = atom.config.get('nyan-indent.useCustomColors');
  const customColors = atom.config.get('nyan-indent.customColors');

  return {
    chosenColor,
    opacity,
    useCustomColors,
    customColors,
  };
};

export const findDecorationsByActivePreferences = (editor, atom) => {
  const preferences = getPreferences(atom);
  const decorations = findDecorations(editor);

  return reduce(decorations, (prev, decoration) => {
    const {
      currentNumber,
    } = decoration.getMarker().getProperties();

    const properties = decoration.getProperties();
    const color = preferences.useCustomColors ?
      properties.style.backgroundColor
      : properties.class.match(/(nyan-indent-)([0-9]+)/)[0];

    return {
      ...prev,
      chosenColor: preferences.useCustomColors ? 'custom' : {
        ...prev.chosenColor,
        [properties.class.match(/([a-z-]+)/g)[2]]:
          (prev.chosenColor[properties.class.match(/([a-z-]+)/g)[2]] || 0) + 1,
      },
      opacity: {
        ...prev.opacity,
        [properties.style.opacity]: (prev.opacity[properties.style.opacity] || 0) + 1,
      },
      colors: {
        ...prev.colors,
        [color]: (prev.colors[color] || 0) + 1,
      },
      indentations: {
        ...prev.indentations,
        [currentNumber]: (prev.indentations[currentNumber] || 0) + 1,
      },
      length: prev.length + 1,
    };
  }, {
    colors: {},
    indentations: {},
    opacity: {},
    chosenColor: {},
    length: 0,
  });
};

export const findDecorationByColor = (decorations, color) =>
  filter(decorations, decoration => decoration.properties.style.backgroundColor === color);

export const togglePackage = (atom) => {
  const workspaceElement = atom.views.getView(atom.workspace);
  atom.commands.dispatch(workspaceElement, 'nyan-indent:toggle');
};
