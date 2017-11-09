'use babel';

import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'string-utils:reverse-selection': () => this.reverseSelection(),
      'string-utils:convert-spaces-to-tabs': () => this.convertSpacesToTabs(),
      'string-utils:convert-tabs-to-spaces': () => this.convertTabsToSpaces(),
      'string-utils:encode-to-base64': () => this.encodeBase64(),
      'string-utils:decode-from-base64': () => this.decodeBase64()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {},

  reverseSelection() {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      let selection = editor.getSelectedText();
      if (!selection) return;
      let reversed = selection.split(/\r?\n/).map((line) => {
        return line.split('').reverse().join('');
      }).join('\n');
      editor.insertText(reversed, { select: true });
    }
  },

  convertSpacesToTabs() {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      let selection = editor.getSelectedText();
      let didSelectAll = false;
      if (!selection) {
        editor.selectAll();
        selection = editor.getSelectedText();
        didSelectAll = true;
      }
      let tabLength = editor.getTabLength();
      let regex = new RegExp('[ ]{' + tabLength + ',}');
      let tabbed = selection.split(/\r?\n/).map((line) => {
        let res = line.match(regex);
        if (res === null) return line;
        return line.replace(regex, '\t'.repeat(res[0].length / tabLength));
      }).join('\n');
      editor.setSoftTabs(false);
      editor.insertText(tabbed, { select: !didSelectAll });
    }
  },

  convertTabsToSpaces() {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      let selection = editor.getSelectedText();
      let didSelectAll = false;
      if (!selection) {
        editor.selectAll();
        selection = editor.getSelectedText();
        didSelectAll = true;
      }
      let tabLength = editor.getTabLength();
      let regex = new RegExp(/\t+/);
      let tabbed = selection.split(/\r?\n/).map((line) => {
        let res = line.match(regex);
        if (res === null) return line;
        return line.replace(regex, ' '.repeat(res[0].length * tabLength));
      }).join('\n');
      editor.setSoftTabs(true);
      editor.insertText(tabbed, { select: !didSelectAll });
    }
  },

  encodeBase64() {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      let selection = editor.getSelectedText();
      if (!selection) return;
      let encoded = Buffer.from(selection, 'utf8').toString('base64');
      editor.insertText(encoded, { select: true });
    }
  },

  decodeBase64() {
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      let selection = editor.getSelectedText();
      if (!selection) return;
      if (selection.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)) {
        let decoded = Buffer.from(selection, 'base64').toString('utf8');
        editor.insertText(decoded, { select: true });
      }
    }
  }

};
