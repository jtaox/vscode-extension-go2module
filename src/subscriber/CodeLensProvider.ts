import {
  Disposable,
  languages,
  TextDocument,
  CodeLens,
  ProviderResult
} from "vscode";
import CodeLenGenerator from "../lib/CodeLenGenerator";
import OpenBrowserCodeLens from "../codeLen/OpenBrowserCodeLens";

class CodeLensProvider implements Disposable {
  private codeLenGenerator: CodeLenGenerator;
  private codeLenDisposable: Disposable | undefined

  constructor(language: string) {
    this.codeLenGenerator = new CodeLenGenerator();

    this.createProvider(language)
  }

  private createProvider(language: string) {
    this.codeLenDisposable = languages.registerCodeLensProvider(
      { scheme: "file", language: "javascript" },
      {
        provideCodeLenses: (document: TextDocument) => {
          const codeLens = this.codeLenGenerator.getCodeLen(
            document,
            language || ""
          );
          
          return codeLens;
        },
        resolveCodeLens: (codeLens: CodeLens): ProviderResult<CodeLens> => {
          if (codeLens instanceof OpenBrowserCodeLens) {
            return OpenBrowserCodeLens.resolve(codeLens);
          }

          return codeLens;
        }
      }
    );
  }

  dispose() {
    this.codeLenDisposable && this.codeLenDisposable.dispose()
  }
}

export default CodeLensProvider