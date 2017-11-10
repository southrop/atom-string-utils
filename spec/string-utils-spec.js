'use strict';

const StringUtils = require('../lib/string-utils');

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('String Utils', () => {
  let workspace, editor, activationPromise;

  let activate = (command, callback) => {
    atom.commands.dispatch(workspace, command);
    waitsForPromise(() => {
      return activationPromise;
    });
    runs(() => {
      return callback();
    });
  };

  beforeEach(() => {
    workspace = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('string-utils');

    waitsForPromise(() => { return atom.workspace.open(); });
    runs(() => {
      editor = atom.workspace.getActiveTextEditor();
    });
  });

  describe('Reversal', () => {
    it('does nothing if there is no selection', () => {
      editor.setText('This is a test string!#%^%$&\\n 1215');
      return activate('string-utils:reverse-selection', () => {
        expect(editor.getText()).toBe('This is a test string!#%^%$&\\n 1215');
      });
    });

    it('reverses the selected text', () => {
      editor.setText('This is a test string!#%^$&\\n 1215');
      editor.selectAll();
      return activate('string-utils:reverse-selection', () => {
        expect(editor.getText()).toBe('5121 n\\&$^%#!gnirts tset a si sihT');
      });
    });

    it('handles each line individually', () => {
      editor.setText('This is a test string!#%^$&\n1215 asdf');
      editor.selectAll();
      return activate('string-utils:reverse-selection', () => {
        expect(editor.getText()).toBe('&$^%#!gnirts tset a si sihT\nfdsa 5121');
      });
    });

    it('handles parts of multiple lines individually', () => {
      editor.setText('This is a test string!#%^$&\n1215 asdf');
      editor.setSelectedBufferRange([[0,21], [1, 6]]);
      return activate('string-utils:reverse-selection', () => {
        expect(editor.getText()).toBe('This is a test string&$^%#!\na 5121sdf');
      });
    });
  });

  describe('Space↔Tab Conversion', () => {
    it('converts the tabs of the entire document if there is no selection', () => {
      editor.setTabLength(2);
      editor.setText('if (test) {\n  for (condition) {\n    return that;\n  }\n  return  this;\n}');
      return activate('string-utils:convert-spaces-to-tabs', () => {
        expect(editor.getText()).toBe('if (test) {\n	for (condition) {\n		return that;\n	}\n	return  this;\n}');
      });
    });

    it('converts the spaces of the entire document if there is no selection', () => {
      editor.setTabLength(2);
      editor.setText('if (test) {\n	for (condition) {\n		return that;\n	}\n	return  this;\n}');
      return activate('string-utils:convert-tabs-to-spaces', () => {
        expect(editor.getText()).toBe('if (test) {\n  for (condition) {\n    return that;\n  }\n  return  this;\n}');
      });
    });

    it('can undo itself', () => {
      editor.setTabLength(2);
      editor.setText('if (test) {\n  for (condition) {\n    return that;\n  }\n  return  this;\n}');
      return activate('string-utils:convert-spaces-to-tabs', () => {
        return activate('string-utils:convert-tabs-to-spaces', () => {
          expect(editor.getText()).toBe('if (test) {\n  for (condition) {\n    return that;\n  }\n  return  this;\n}');
        });
      });
    });
  });

  describe('Base64 Conversion', () => {
    it('does nothing to plain text if there is no selection', () => {
      editor.setText('This is a test string!#%^%$&\\n 1215あ啊');
      return activate('string-utils:encode-in-base64', () => {
        expect(editor.getText()).toBe('This is a test string!#%^%$&\\n 1215あ啊');
      });
    });

    it('converts plain text into base64 successfully', () => {
      editor.setText('This is a test string!#%^$&\\n 1215あ啊');
      editor.selectAll();
      return activate('string-utils:encode-in-base64', () => {
        expect(editor.getText()).toBe('VGhpcyBpcyBhIHRlc3Qgc3RyaW5nISMlXiQmXG4gMTIxNeOBguWVig==');
      });
    });

    it('does nothing to base64 if there is no selection', () => {
      editor.setText('VGhpcyBpcyBhIHRlc3Qgc3RyaW5nISMlXiQmXG4gMTIxNeOBguWVig==');
      return activate('string-utils:decode-from-base64', () => {
        expect(editor.getText()).toBe('VGhpcyBpcyBhIHRlc3Qgc3RyaW5nISMlXiQmXG4gMTIxNeOBguWVig==');
      });
    });

    it('converts base64 into plain text successfully', () => {
      editor.setText('VGhpcyBpcyBhIHRlc3Qgc3RyaW5nISMlXiQmXG4gMTIxNeOBguWVig==');
      editor.selectAll();
      return activate('string-utils:decode-from-base64', () => {
        expect(editor.getText()).toBe('This is a test string!#%^$&\\n 1215あ啊');
      });
    });

    it('can undo itself', () => {
      editor.setText('This is a test string!#%^$&\\n 1215あ啊');
      editor.selectAll();
      return activate('string-utils:encode-in-base64', () => {
        return activate('string-utils:decode-from-base64', () => {
          expect(editor.getText()).toBe('This is a test string!#%^$&\\n 1215あ啊');
        });
      });
    });
  });

  describe('URL Notation Conversion', () => {
    it('does nothing to plain text if there is no selection', () => {
      editor.setText('http://localhost:30001/data?zip=47401&utc_begin=2013-8-1 00:00:00&utc_end=2013-8-2 00:00:00&country_code=USA');
      return activate('string-utils:encode-in-url-encoding', () => {
        expect(editor.getText()).toBe('http://localhost:30001/data?zip=47401&utc_begin=2013-8-1 00:00:00&utc_end=2013-8-2 00:00:00&country_code=USA');
      });
    });

    it('converts plain text into url notation', () => {
      editor.setText('http://localhost:30001/data?zip=47401&utc_begin=2013-8-1 00:00:00&utc_end=2013-8-2 00:00:00&country_code=USA');
      editor.selectAll();
      return activate('string-utils:encode-in-url-encoding', () => {
        expect(editor.getText()).toBe('http%3A%2F%2Flocalhost%3A30001%2Fdata%3Fzip%3D47401%26utc_begin%3D2013-8-1%2000%3A00%3A00%26utc_end%3D2013-8-2%2000%3A00%3A00%26country_code%3DUSA');
      });
    });

    it('does nothing to url notation text if there is no selection', () => {
      editor.setText('http%3A%2F%2Flocalhost%3A30001%2Fdata%3Fzip%3D47401%26utc_begin%3D2013-8-1%2000%3A00%3A00%26utc_end%3D2013-8-2%2000%3A00%3A00%26country_code%3DUSA');
      return activate('string-utils:decode-from-url-encoding', () => {
        expect(editor.getText()).toBe('http%3A%2F%2Flocalhost%3A30001%2Fdata%3Fzip%3D47401%26utc_begin%3D2013-8-1%2000%3A00%3A00%26utc_end%3D2013-8-2%2000%3A00%3A00%26country_code%3DUSA');
      });
    });

    it('converts url notation into plain text', () => {
      editor.setText('http%3A%2F%2Flocalhost%3A30001%2Fdata%3Fzip%3D47401%26utc_begin%3D2013-8-1%2000%3A00%3A00%26utc_end%3D2013-8-2%2000%3A00%3A00%26country_code%3DUSA');
      editor.selectAll();
      return activate('string-utils:decode-from-url-encoding', () => {
        expect(editor.getText()).toBe('http://localhost:30001/data?zip=47401&utc_begin=2013-8-1 00:00:00&utc_end=2013-8-2 00:00:00&country_code=USA');
      });
    });

    it('can undo itself', () => {
      editor.setText('http://localhost:30001/data?zip=47401&utc_begin=2013-8-1 00:00:00&utc_end=2013-8-2 00:00:00&country_code=USA');
      editor.selectAll();
      return activate('string-utils:encode-in-url-encoding', () => {
        return activate('string-utils:decode-from-url-encoding', () => {
          expect(editor.getText()).toBe('http://localhost:30001/data?zip=47401&utc_begin=2013-8-1 00:00:00&utc_end=2013-8-2 00:00:00&country_code=USA');
        });
      });
    });
  });
});
