'use babel';

import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'string-utils:reverse-selection': () => this.transform(this.reverse, false),
      'string-utils:convert-spaces-to-tabs': () => this.transform(this.convertSpacesToTabs, true),
      'string-utils:convert-tabs-to-spaces': () => this.transform(this.convertTabsToSpaces, true),
      'string-utils:encode-in-base64': () => this.transform(this.encodeBase64, false),
      'string-utils:decode-from-base64': () => this.transform(this.decodeBase64, false),
      'string-utils:encode-in-url-encoding': () => this.transform(encodeURIComponent, false),
      'string-utils:decode-from-url-encoding': () => this.transform(decodeURIComponent, false)
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  transform(transformation, shouldSelectAll) {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      let didSelectAll = false;
      let selection = editor.getSelectedText();
      if (!selection) {
        if (!shouldSelectAll) return;
        editor.selectAll();
        didSelectAll = true;
        selection = editor.getSelectedText();
      }
      let transformed = transformation(selection, editor);
      editor.insertText(transformed, { select: !didSelectAll });
    }
  },

  reverse(selection) {
    return selection.split(/\r?\n/).map((line) => {
      return line.split('').reverse().join('');
    }).join('\n');
  },

  convertSpacesToTabs(selection, editor) {
    let tabLength = editor.getTabLength();
    let regex = new RegExp('[ ]{' + tabLength + ',}');
    let tabbed = selection.split(/\r?\n/).map((line) => {
      let res = line.match(regex);
      if (res === null) return line;
      return line.replace(regex, '\t'.repeat(res[0].length / tabLength));
    }).join('\n');
    editor.setSoftTabs(false);
    return tabbed;
  },

  convertTabsToSpaces(selection, editor) {
    let tabLength = editor.getTabLength();
    let regex = new RegExp(/\t+/);
    let spaced = selection.split(/\r?\n/).map((line) => {
      let res = line.match(regex);
      if (res === null) return line;
      return line.replace(regex, ' '.repeat(res[0].length * tabLength));
    }).join('\n');
    editor.setSoftTabs(true);
    return spaced;
  },

  encodeBase64(selection) {
    return Buffer.from(selection, 'utf8').toString('base64');
  },

  decodeBase64(selection) {
    if (selection.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)) {
      return Buffer.from(selection, 'base64').toString('utf8');
    }
  }

};
