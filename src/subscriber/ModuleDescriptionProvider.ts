import {
  Disposable,
  languages,
  ProviderResult,
  Hover,
  TextDocument,
  Position,
  MarkdownString
} from "vscode";
import Dependence from "../lib/Dependence";
import Declarations from "./../Declarations";
import PackageHover from './../hover/PackageHover';

class CodeLensProvider implements Disposable {
  private disposable: Disposable | undefined;

  constructor() {
    this.createProvider();
  }

  private createProvider() {
    this.disposable = languages.registerHoverProvider("javascript", {
      provideHover(
        document: TextDocument,
        position: Position
      ): ProviderResult<Hover> {
        return Declarations.getInstance()
          .getDecoration(document, position)
          .then(res => {
            if (res) {
              const { githubInfo = { description: '' }, links, _error } = res;

              if (_error) {
                return new PackageHover(new MarkdownString(_error.msg), links);
              }

              return new PackageHover(new MarkdownString(githubInfo.description), links);
            }
            
          })
          .catch(err => {
            // return new Hover();
            return undefined
          });
      }
    });
  }

  dispose() {
    this.disposable && this.disposable.dispose();
  }
}

export default CodeLensProvider;
