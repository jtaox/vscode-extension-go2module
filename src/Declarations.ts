import Parser, { Declaration } from "./lib/parse";
import { TextDocument, Uri, Position } from "vscode";
import { dependence } from "./lib/Dependence";

class Declarations {
  static instance: Declarations;
  private parser: Parser;
  private docMap: Map<Uri, Declaration[]> = new Map();

  constructor() {
    this.parser = new Parser();
  }

  /**
   * 获取指定document下的所有declarations
   * @param document
   */
  public get(document: TextDocument): Declaration[] {
    const memo = this.docMap.get(document.uri) || [];

    if (!memo.length) {
      const language = document.languageId;
      return this.update(document, language);
    }

    return memo;
  }

  public async getDecoration(
    document: TextDocument,
    position: Position
  ): Promise<Declaration | undefined> {
    
    const declarations = this.get(document);
    const declaration = declarations.find(d => {
      const { range } = d;
      return range.contains(position);
    });

    if (declaration) {
      await this.initDecoration(declaration);

      return declaration;
    } else {
      throw new Error('Not third-party dependency');
    }
  }

  private async initDecoration(declaration: Declaration) {
      declaration.getPackage();
      await declaration.mountGithubInfoField();
      declaration.parseLink();
  }

  update(document: TextDocument, language: string): Declaration[] {
    const declarationList = this.parser
      .parse(document, language)
      .filter(d => dependence.has(d.libName));

    this.docMap.set(document.uri, declarationList);

    return declarationList;
  }

  /**
   * 获取实例
   *
   * @static
   * @returns
   * @memberof Declarations
   */
  public static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new Declarations();

    return this.instance;
  }
}

export default Declarations;
