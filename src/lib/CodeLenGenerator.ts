import { TextDocument, Range, Position, CodeLens, Uri } from "vscode";
import OpenBrowserCodeLens from "./../codeLen/OpenBrowserCodeLens";
import Dependence from "./Dependence";
import { Declaration, Location } from "./parse";
import Declarations from "./../Declarations";

class CodeLenGenerator {
  private dependence: Dependence;
  private declarations: Declarations;

  constructor() {
    this.dependence = Dependence.getInstance();
    this.declarations = Declarations.getInstance();
  }

  getCodeLen(document: TextDocument, language: string) {
    return this.declarations
      .get(document)
      .filter(Boolean)
      .map((item: Declaration) => {
        item.getPackage();
        item.parseLink();
        
        const { location, links } = item;
        const range = this.createRange(location);

        return links.map(link => {
          return this.generateCommonCodeLen(link.url, link.title, range);
        });
      })
      .reduce((pre, cur) => pre.concat(cur), []);
  }

  createRange(loc: Location): Range {
    const { start, end } = loc;

    return new Range(start, end);
  }

  generateCommonCodeLen(url: string, title: string, range: Range): CodeLens {
    return new OpenBrowserCodeLens(url, title, range);
  }
}

export default CodeLenGenerator;
