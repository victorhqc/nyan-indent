'use babel';

import map from 'lodash/map';
import partial from 'lodash/partial';

const removePaint = (textEditor) => {
  const decorations = textEditor.getDecorations({
    type: 'text',
    class: 'nyan-indent',
  });
  decorations.forEach(decoration => decoration.marker.destroy());
};

const paintTextEditorLine = (textEditor, { tabLength, line, colors }) => {
  const lineIndentation = textEditor.indentationForBufferRow(line);
  const indentationLimit = lineIndentation * tabLength;

  const numberOfColors = colors.length;

  // Create a Marker for each indentation
  for (
    let indentation = 0, counter = 0;
    indentation < indentationLimit;
    indentation += tabLength, counter += 1
  ) {
    const initialPoint = [line, indentation];
    const finalPoint = [line, (indentation + tabLength)];
    const range = [initialPoint, finalPoint];
    const color = colors[counter % numberOfColors];

    const marker = textEditor.markBufferRange(range);

    try {
      textEditor.decorateMarker(marker, {
        type: 'text',
        class: 'nyan-indent',
        style: {
          backgroundColor: color,
        },
      });
    } catch (e) {
      console.log('e', e);
    }
  }
};

const readTextEditorLines = (textEditor, { tabLength, numberOfLines, colors }) => {
  for (let line = 0; line < numberOfLines; line += 1) {
    paintTextEditorLine(textEditor, { tabLength, line, colors });
  }
};

const paintTextEditor = (colors, textEditor) => {
  const tabLength = textEditor.getTabLength();
  const numberOfLines = textEditor.getLineCount();

  // Check all the existing lines for text Editor
  readTextEditorLines(textEditor, { tabLength, numberOfLines, colors });
};

const removePaintFromRange = (textEditor, range) => {
  const markers = textEditor.findMarkers({
    startBufferRow: range.start.row,
    endBufferRow: range.end.row,
  });
  markers.forEach(marker => marker.destroy());
};

const paintMultipleLines = (textEditor, {
  tabLength,
  fromLine,
  toLine,
  colors,
}) => {
  for (let line = fromLine; line <= toLine; line += 1) {
    paintTextEditorLine(textEditor, { tabLength, line, colors });
  }
};

/**
 * Called when user modifies text. Cleans previous markers and repaints
 * on top of changes.
 * @param  {Object} textEditor
 * @param  {Array} changes
 */
export const textDidChange = (textEditor, colors, changes) => {
  const tabLength = textEditor.getTabLength();
  return map(changes.changes, (change) => {
    // Cleans previous markers before adding new ones.
    removePaintFromRange(textEditor, change.newRange);

    const fromLine = change.newRange.start.row;
    const toLine = change.newRange.end.row;

    if (fromLine === toLine) {
      return paintTextEditorLine(textEditor, {
        tabLength,
        line: fromLine,
        colors,
      });
    }

    // Updates changes in different lines.
    return paintMultipleLines(textEditor, {
      tabLength,
      fromLine,
      toLine,
      colors,
    });
  });
};

/**
 * Paint all text from textEditor. This runs on activate or `toggle`
 * @param  {Object} atom
 */
export const paint = (atom, colors) =>
  atom.workspace.getTextEditors().forEach(partial(paintTextEditor, colors));

/**
 * Cleans all text from textEditor. This runs on `toggle`
 * @param  {Object} atom
 */
export const clean = atom => atom.workspace.getTextEditors().forEach(removePaint);
