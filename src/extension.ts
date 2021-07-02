
import * as vscode from 'vscode';
import formatInit from './modules';
 
 export function activate(context: vscode.ExtensionContext) {
     // Registration command, which is the same as the command in package.json 
     let disposable = vscode.commands.registerCommand('extension.vueFormat', function () {
         let acEditor = vscode.window.activeTextEditor;
 
         if (acEditor && acEditor.document.languageId === 'vue') {
             formatInit.init();
         } else {
             vscode.window.showInformationMessage('It‘s not a .vue file');
         }
         // vscode.window.showInformationMessage('vue format now');
     });
 
     context.subscriptions.push(disposable);

 }
 
 export function deactivate() {
     vscode.window.showInformationMessage('deactivated');
 }
  