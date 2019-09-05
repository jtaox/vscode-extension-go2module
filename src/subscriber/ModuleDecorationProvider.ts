import {
  Disposable,
  TextEditorDecorationType,
  TextEditorSelectionChangeEvent,
  window,
  Position,
  Range,
  DecorationRangeBehavior,
  DecorationInstanceRenderOptions
} from "vscode";
import Declarations from "../Declarations";
import { IGithubInfo } from "./../lib/parse";

class ModuleDecorationProvider implements Disposable {
  private tesxtEditorSelectionDisposable: Disposable | undefined;

  constructor() {
    this.init();
  }

  private init() {
    this.tesxtEditorSelectionDisposable = window.onDidChangeTextEditorSelection(
      (() => {
        let lastDecorationType: TextEditorDecorationType | null = null;

        return (evt: TextEditorSelectionChangeEvent) => {
          // console.log(evt.selections[0].active);
          if (!window.activeTextEditor) {
            return;
          }
          if (lastDecorationType) {
            console.log(lastDecorationType, 'dispose dispose')
            lastDecorationType.dispose();
          }

          const active = evt.selections[0].active;
          console.log(evt.selections[0])

          Declarations.getInstance()
            .getDecoration(window.activeTextEditor.document, active)
            .then(res => {
              if (!res) {
                return;
              }
              lastDecorationType = this.getTextEditorDecorationType();

              if (window.activeTextEditor && lastDecorationType) {
                const { line, character } = active;

                window.activeTextEditor.setDecorations(lastDecorationType, [
                  {
                    range: this.getRange(line, character),
                    renderOptions: this.getRenderOptions(res.githubInfo)
                  }
                ]);
              }
            })
            .catch(() => {
              if (lastDecorationType) {
                lastDecorationType.dispose();
              }
            });
        };
      })()
    );
  }

  private getTextEditorDecorationType(): TextEditorDecorationType {
    const type = window.createTextEditorDecorationType({
      after: {
        margin: "0 0 0 3em",
        textDecoration: "none"
      },
      rangeBehavior: DecorationRangeBehavior.ClosedOpen
    });

    return type;
  }

  private getRange(line: number, character: number): Range {
    return new Range(new Position(line, 0), new Position(line, character));
  }

  private getRenderOptions(
    githubInfo: IGithubInfo | undefined
  ): DecorationInstanceRenderOptions {
    return {
      after: {
        contentText: githubInfo ? githubInfo.description : "none",
        color: "#99999959",
        margin: "0 0 0 3em"
      }
    };
  }

  dispose() {
    if (this.tesxtEditorSelectionDisposable) {
      this.tesxtEditorSelectionDisposable.dispose();
    }
  }
}

export default ModuleDecorationProvider;
