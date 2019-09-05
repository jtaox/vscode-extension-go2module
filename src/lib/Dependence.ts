import { getNodeModulesPathMap } from "./helper";
import { workspace, TextDocument } from "vscode";

interface PackageRepositoryInterface {
  type: string;
  url: string;
}

export interface PackageInterface {
  devDependencies: string;
  dependencies: string;
  homepage: string;
  repository: PackageRepositoryInterface;
}

class Dependence {
  private dependencies: Map<string, PackageInterface> = new Map();
  private dependPathMap: Map<string, string> = new Map();

  public static instance: Dependence;

  constructor(dependPathMap: Map<string, string> | null) {
    if (dependPathMap) {
      this.dependPathMap = dependPathMap;
    }
  }

  public getLibPkg(dependName: string): PackageInterface | null | undefined {
    // const info = this.dependencies.get(dependName);

    if (this.dependPathMap === null) {
      return null;
    }

    const dependPath = this.dependPathMap.get(dependName);

    if (dependPath) {
      const dependInfo = require(dependPath);
      this.dependencies.set(dependName, dependInfo);

      return dependInfo;
    } else {
      return undefined;
    }
  }
  
  public has(name: string): boolean {
    return this.dependPathMap.has(name);
  }

  public static getInstance(): Dependence | any {
    if (this.instance) {
      return this.instance;
    }

    const { workspaceFolders } = workspace;

    if (workspaceFolders && workspaceFolders.length) {
      const path = workspaceFolders[0].uri.fsPath;
      const pathMap = getNodeModulesPathMap(path);
      this.instance = new Dependence(pathMap);

      return this.instance;
    }
  }
}

export default Dependence;
export const dependence = Dependence.getInstance();
