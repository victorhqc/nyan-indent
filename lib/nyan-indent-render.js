'use babel';

import map from 'lodash/map';
import partial from 'lodash/partial';

const removePaint = (textEditor) => {
  const markers = textEditor.findMarkers({
    nyanIndent: true,
  });
  map(markers, marker => marker.destroy());
};

const calculateDecoration = ({
  chosenColor,
  opacity,
  useCustomColors,
  customColors,
  counter,
}) => {
  const NUMBER_OF_COLORS = 5;
  const currentNumber = counter % NUMBER_OF_COLORS;

  // The first thing to do is identify which approach to use according to Atom's API.
  // Style or class name.
  if (useCustomColors) {
    return {
      class: 'nyan-indent',
      style: {
        opacity: opacity / 100,
        backgroundColor: customColors[currentNumber].toHexString(),
      },
    };
  }

  return {
    class: `nyan-indent nyan-indent-${currentNumber} ${chosenColor}`,
    style: {
      opacity: opacity / 100,
    },
  };
};

const paintTextEditorLine = (textEditor, {
  tabLength,
  line,
  ...preferences
}) => {
  const lineIndentation = textEditor.indentationForBufferRow(line);
  const indentationLimit = lineIndentation * tabLength;

  // Create a Marker for each indentation
  for (
    let indentation = 0, counter = 0;
    indentation < indentationLimit;
    indentation += tabLength, counter += 1
  ) {
    const initialPoint = [line, indentation];
    const finalPoint = [line, (indentation + tabLength)];
    const range = [initialPoint, finalPoint];
    // const color = colors[counter % NUMBER_OF_COLORS];
    const decorations = calculateDecoration({
      counter,
      ...preferences,
    });

    const marker = textEditor.markBufferRange(range);

    marker.setProperties({
      nyanIndent: true,
    });

    try {
      textEditor.decorateMarker(marker, {
        type: 'text',
        ...decorations,
      });
    } catch (e) {
      throw new Error(e);
    }
  }
};

const readTextEditorLines = (textEditor, { tabLength, numberOfLines, ...preferences }) => {
  for (let line = 0; line < numberOfLines; line += 1) {
    paintTextEditorLine(textEditor, { tabLength, line, ...preferences });
  }
};

const paintTextEditor = (preferences, textEditor) => {
  const tabLength = textEditor.getTabLength();
  const numberOfLines = textEditor.getLineCount();

  // Check all the existing lines for text Editor
  readTextEditorLines(textEditor, { tabLength, numberOfLines, ...preferences });
};

const removePaintFromRange = (textEditor, range) => {
  const markers = textEditor.findMarkers({
    nyanIndent: true,
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
export const textDidChange = (textEditor, preferences, changes) => {
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
        ...preferences,
      });
    }

    // Updates changes in different lines.
    return paintMultipleLines(textEditor, {
      tabLength,
      fromLine,
      toLine,
      ...preferences,
    });
  });
};

/**
 * Paint all text from textEditor. This runs on activate or `toggle`
 * @param  {Object} atom
 */
export const paint = (atom, preferences) =>
  atom.workspace.getTextEditors().forEach(partial(paintTextEditor, preferences));

/**
 * Cleans all text from textEditor. This runs on `toggle`
 * @param  {Object} atom
 */
export const clean = atom => atom.workspace.getTextEditors().forEach(removePaint);
