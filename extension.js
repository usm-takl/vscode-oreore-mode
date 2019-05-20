const vscode = require('vscode');
const OREORE_MODE = { scheme: 'file', language: 'oreore' };

function helloWorld() {
    vscode.window.showInformationMessage('Hello, world!');
}

function formatFile(textEditor, textEditorEdit) {
    const wholeText = textEditor.document.getText();
    const wholeRange = new vscode.Range(
        textEditor.document.positionAt(0),
        textEditor.document.positionAt(wholeText.length));
    const newWholeText = wholeText.split(/\r?\n/).map(line => line.replace(/^\s+/,'')).join('\n');
    textEditor.edit(editBuilder => editBuilder.replace(wholeRange, newWholeText));
}

class OreoreHoverProvider {
    provideHover(document, position, token) {
        let wordRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_]+/);
        if (wordRange === undefined) return Promise.reject("no word here");

        let currentWord = document.lineAt(position.line).text.slice(wordRange.start.character, wordRange.end.character);
        return Promise.resolve(new vscode.Hover(currentWord));
    }
}

class OreoreDefinitionProvider {
    provideDefinition(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_]+/);
        if (!wordRange) return Promise.reject('No word here.');

        const currentWord = document.lineAt(position.line).text.slice(wordRange.start.character, wordRange.end.character);

        let line;
        if (currentWord == "apple") line = 0;
        else if (currentWord == "banana") line = 1;
        else if (currentWord == "cherry") line = 2;
        else return Promise.reject('No definition found');

        const uri = vscode.Uri.file(document.fileName);
        const pos = new vscode.Position(line, 4);
        const loc = new vscode.Location(uri, pos);
        return Promise.resolve(loc);
    }
}

class OreoreCompletionItemProvider {
    provideCompletionItems(document, position, token) {
        const completionItems = [
            {
                label: 'apple',
                kind: vscode.CompletionItemKind.Variable // see https://code.visualstudio.com/api/references/vscode-api#CompletionItemKind
            },
            {
                label: 'banana',
                kind: vscode.CompletionItemKind.Value
            },
            {
                label: 'cherry',
                kind: vscode.CompletionItemKind.Method
            }
        ];
        let completionList = new vscode.CompletionList(completionItems, false);
        return Promise.resolve(completionList);
    }
}

class OreoreSignatureHelpProvider {
    provideSignatureHelp(document, position, token) {
        const line = document.lineAt(position.line);
        if (!line.text.substr(0, position.character).match(/\(/)) return vscode.reject('no open parenthesis before cursor');

        const signatureHelp = new vscode.SignatureHelp();
        signatureHelp.activeParameter = 0;
        signatureHelp.activeSignature = 0;
        signatureHelp.signatures = [
            new vscode.SignatureInformation('Alice', 'King'),
            new vscode.SignatureInformation('Bob', 'Queen'),
            new vscode.SignatureInformation('Carol', 'Jack')
        ];
        return Promise.resolve(signatureHelp);
    }
}

const treeData =
    [
        {
            label: "root1",
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            children: [
                {
                    label: "root1/child1",
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    command:
                    {
                        command: "oreore.helloWorld",
                        title: "say hello",
                        arguments: []
                    }
                },
                {
                    label: "root1/child2",
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    command:
                    {
                        command: "oreore.helloWorld",
                        title: "say hello",
                        arguments: []
                    }
                }
            ]
        },
        {
            label: "root2",
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            children: [
                {
                    label: "root2/child1",
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    command:
                    {
                        command: "oreore.helloWorld",
                        title: "say hello",
                        arguments: []
                    }
                },
                {
                    label: "root2/child2",
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    command:
                    {
                        command: "oreore.helloWorld",
                        title: "say hello",
                        arguments: []
                    }
                }
            ]
        }
    ];

class OreoreTreeDataProvider {
    getTreeItem(element)  {
        return element;
    }

    getChildren(element) {
        if (!element) {
            return treeData;
        } else {
            return element.children;
        }
    }
}

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('oreore.helloWorld', helloWorld));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('oreore.formatFile', formatFile));
    context.subscriptions.push(vscode.languages.registerHoverProvider(OREORE_MODE, new OreoreHoverProvider()));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(OREORE_MODE, new OreoreDefinitionProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(OREORE_MODE, new OreoreCompletionItemProvider(), '.'));
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider(OREORE_MODE, new OreoreSignatureHelpProvider(), '(', ','));
    vscode.window.registerTreeDataProvider('oreore', new OreoreTreeDataProvider());
}

function deactivate() {
    return undefined;
}

module.exports = { activate, deactivate };
