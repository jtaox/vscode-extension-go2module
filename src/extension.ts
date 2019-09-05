// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import Controler from "./Controler";
import Declarations from "./Declarations";
import { constants } from "http2";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, "vscode-extension-go2module" is now active!');

  new Controler(context);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension-openbrowser",
    url => {
      if (url && typeof url !== "string") {
        url = url.url;
      }
      if (url) {
        vscode.env.openExternal(vscode.Uri.parse(url));
      }
    }
  );

  // vscode.window.onDidChangeTextEditorSelection(
  //   (function() {
  //     let lastDecorationType: vscode.TextEditorDecorationType | null = null;

  //     return function(evt: vscode.TextEditorSelectionChangeEvent) {
  //       // console.log(evt.selections[0].active);
  //       if (!vscode.window.activeTextEditor) {
  //         return;
  //       }
  //       if (lastDecorationType) {
  //         lastDecorationType.dispose();
  //       }

  //       const active =  evt.selections[0].active;
        
  //       Declarations.getInstance()
  //         .getDecoration(
  //           vscode.window.activeTextEditor.document,
  //           active
  //         )
  //         .then(res => {
  //           if (!res) {
  //             return;
  //           }

  //           lastDecorationType = vscode.window.createTextEditorDecorationType({
  //             after: {
  //               margin: '0 0 0 3em',
  //               textDecoration: 'none'
  //           },
  //           rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen
  //           });

  //           if (vscode.window.activeTextEditor && lastDecorationType) {
  //             console.log("------", res);

  //             const { line, character } = active

  //             vscode.window.activeTextEditor.setDecorations(
  //               lastDecorationType,
  //               [
  //                 {
  //                   range: new vscode.Range(
  //                     new vscode.Position(line, 0),
  //                     new vscode.Position(line, character)
  //                   ),
  //                   renderOptions: {
  //                     after: {
  //                       contentText: res.githubInfo
  //                         ? res.githubInfo.description
  //                         : "none",
  //                       color: "#99999959",
  //                       margin: "0 0 0 3em"
  //                     }
  //                   }
  //                 }
  //               ]
  //             );
  //           }
  //         })
  //         .catch(() => {
  //           if (lastDecorationType) {
  //             lastDecorationType.dispose();
  //           }
  //         });
  //     };
  //   })()
  // );
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
