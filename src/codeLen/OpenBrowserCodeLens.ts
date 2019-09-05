import { CodeLens, Command, Range } from "vscode";

class OpenBrowserCodeLens extends CodeLens {

	static resolve(codeLens: OpenBrowserCodeLens): CodeLens {
    codeLens.command = {
      title: codeLens.codelensTitle,
      command: "extension-openbrowser",
      arguments: [codeLens.url]
    };

    return codeLens;
	}
  private url: string;
  private codelensTitle: string;

  constructor(url: string, codelensTitle: string, range: Range, command?: Command | undefined) {
    super(range, command);
    this.url = url;
    this.codelensTitle = codelensTitle;
  }
}


export default OpenBrowserCodeLens;