import { parse as parser } from "@babel/parser";
import _traverse from "@babel/traverse";
import { TextDocument, Position, Range, Uri } from "vscode";
import { babelPos2vsPos, parseGithubUrl } from "./helper";
import { PackageInterface, dependence } from "./Dependence";
import { get } from "request";
import {
  DeclarationError,
  noFoundNodeModulesError,
  noFoundDependenceError,
  fetchGithubInfoError,
  repositoryUndefinedError,
  notGithubRepositoryError
} from "./../constant";

interface LanguagePlugin {
  javascript: Array<string>;
  typescript: Array<string>;
}

export interface Location {
  start: Position;
  end: Position;
}

export interface IGithubInfo {
  description: string;
}

export interface IDependenceLink {
  title: string;
  url: string;
}

const COMMON_PLUGINS = [
  "estree",
  "jsx",
  "flowComments",
  "doExpressions",
  "objectRestSpread",
  "decorators-legacy",
  "classProperties",
  "classPrivateProperties",
  "classPrivateMethods",
  "exportDefaultFrom",
  "exportNamespaceFrom",
  "asyncGenerators",
  "functionBind",
  "functionSent",
  "dynamicImport",
  "numericSeparator",
  "optionalChaining",
  "importMeta",
  "bigInt",
  "optionalCatchBinding",
  "throwExpressions",
  ["pipelineOperator", { proposal: "minimal" }],
  "nullishCoalescingOperator"
];

const TS_PLUGINS: Array<string> = ["typescript"];

const JS_PLUGINS: Array<string> = ["flow"];

const PLUGINS_MAP: LanguagePlugin | any = {
  javascript: JS_PLUGINS,
  typescript: TS_PLUGINS
};

export class Declaration {
  public libName: string = "";
  public node: any = {};
  public location: Location;
  public range: Range;
  public package: PackageInterface | undefined;
  public githubInfo: IGithubInfo | undefined;
  public links: IDependenceLink[] = [];
  public _error: DeclarationError | undefined = undefined;

  constructor(libName: string, node: any, location: Location) {
    this.libName = libName;
    this.node = node;
    this.location = this.convertLoc(location);
    this.range = new Range(this.location.start, this.location.end);
  }

  /**
   * 判断指定的pos是否在当前Declaration范围内
   *
   * @param {Position} pos
   * @returns {boolean}
   * @memberof Declaration
   */
  public contains(pos: Position): boolean {
    const { start, end } = this.location;

    return pos.isAfter(start) && pos.isBefore(end);
  }

  getPackage() {
    if (this.package) {
      return;
    }

    const curPkg = dependence.getLibPkg(this.libName);
    if (curPkg) {
      this.package = curPkg;
    } else {
      // 没有node_modules目录
      if (curPkg === null) {
        this._error = noFoundNodeModulesError;
      }

      // 没找到这个依赖
      if (curPkg === undefined) {
        this._error = noFoundDependenceError;
      }
    }

  }

  public async mountGithubInfoField() {
    if (!this.githubInfo) {
      try {
        const githubInfo = await this.getGithubInfo();

        if (githubInfo) {
          this.githubInfo = githubInfo;
        } else {
          this._error = fetchGithubInfoError;
        }
      } catch (error) {
        console.log(error);
        this._error = fetchGithubInfoError;
      }
    }
  }

  public parseLink() {
    if (!this.links.length && this.package) {
      const { homepage, repository } = this.package;

      // 主页
      if (homepage) {
        this.links.push({ title: "Homepage", url: homepage });
      }

      // git仓库
      if (repository) {
        const uri = Uri.parse(repository.url);

        let url = "";

        if (uri.scheme.match(/^https?$/)) {
          url = repository.url;
        } else {
          url = `https://${uri.authority}${uri.path}`;
        }

        // repository domain
        let domain = uri.authority.split(".")[0];
        domain = domain.charAt(0).toUpperCase() + domain.slice(1);

        this.links.push({ title: "Github", url });
      }
    }
  }

  private getGithubInfo() {
    const pkg = this.package;

    if (!pkg) {
      return;
    }

    // package.json中未定义repository字段
    if (!pkg.repository) {
      this._error = repositoryUndefinedError;
      return;
    }

    const { domain, url } = parseGithubUrl(pkg.repository.url);

    // 非github repository
    if (domain !== "Github") {
      this._error = notGithubRepositoryError;
      return;
    }

    const uri = Uri.parse(url);
    // /facebook/react.git

    let [owner, repo] = uri.path.split("/").filter(Boolean);

    const index = repo.indexOf(".git");
    if (~index) {
      repo = repo.substr(0, index);
    }

    return this.fetchDetailInfoFromGithub({
      owner,
      repo
    });
  }

  private fetchDetailInfoFromGithub({
    owner,
    repo
  }: {
    owner: string;
    repo: string;
  }): Promise<IGithubInfo> {
    // https://api.github.com/repos/jtaox/vscode-extension-translatorX

    return new Promise((resolve, reject) => {
      get(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: { "user-agent": "node.js" },
          json: true
        },
        (error, _, body) => {
          if (body) {
            resolve(body);
          } else {
            reject(error);
          }
        }
      );
    });

    // this.package = curPkg
    // console.log(this.githubInfo, '==')
    // get()
  }

  private convertLoc(location: Location): Location {
    const start = babelPos2vsPos(location.start);
    const end = babelPos2vsPos(location.end);

    return {
      start,
      end
    };
  }
}

class Parse {
  public parse(document: TextDocument, language: string): Declaration[] {
    const text = document.getText();

    let ast = null;

    try {
      ast = parser(text, {
        sourceType: "module",
        plugins: [...COMMON_PLUGINS, ...(PLUGINS_MAP[language] || [])]
      });
    } catch (error) {
      console.log(error);
      ast = "";
    }

    return this.traverser(ast);
  }

  private traverser(ast: string): Declaration[] {
    const declarationList: Array<Declaration> = [];

    _traverse(ast, {
      ImportDeclaration: ({ node }: any) => {
        const libName = node.source.value;
        declarationList.push(new Declaration(libName, node, node.loc));
      },
      CallExpression: ({ node }: any) => {
        if (node.callee.name === "require") {
          const args = node.arguments;
          if (args && args.length) {
            const arg = args[0].value;
            declarationList.push(new Declaration(arg, node, node.loc));
          }
        }
      }
    });

    return declarationList;
  }
}

export default Parse;
