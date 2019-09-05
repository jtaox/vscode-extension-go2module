import { statSync, readdirSync, accessSync } from "fs";
import { join } from "path";
import { Position, Uri } from "vscode";

// 获取package.json，根据指定路径逐级向上查找
export const getPkg = (path: string = ""): any => {
  if (!path) {
    return null;
  }

  const stat = statSync(path);

  if (stat.isFile()) {
    return getPkg(join(path, ".."));
  }

  if (stat.isDirectory()) {
    const pkgPath = join(path, "package.json");
    let pkgStat = null;

    try {
      pkgStat = statSync(pkgPath);
    } catch (error) {}

    // 没有package.json 或者 package.json为目录情况
    if (!pkgStat || pkgStat.isDirectory()) {
      return getPkg(join(path, ".."));
    }

    if (pkgStat.isFile()) {
      return require(pkgPath);
    }
  }

  return null;
};

// 获取项目依赖的库的package.json的绝对路径
export const getNodeModulesPathMap = (
  path: string = ""
): Map<string, string> | null => {
  if (!path || path === "/") {
    return null;
  }

  const stat = statSync(path);

  if (stat.isFile()) {
    return getNodeModulesPathMap(join(path, ".."));
  }

  if (stat.isDirectory()) {
    const nmPath = join(path, "node_modules");
    let nmStat = null;

    try {
      nmStat = statSync(nmPath);
    } catch (error) {}

    // 没有package.json 或者 package.json为目录情况
    if (!nmStat || nmStat.isFile()) {
      return getNodeModulesPathMap(join(path, ".."));
    }

    if (nmStat.isDirectory()) {
      const paths = readdirSync(nmPath);
      const map = new Map<string, string>();

      paths.forEach(path => {
        const depPkgPath = join(nmPath, path, "package.json");
        let available = false;
        try {
          // 判断是否可以访问
          accessSync(depPkgPath);
          available = true;
        } catch (error) {}

        map.set(path, available ? join(nmPath, path, "package.json") : "");
      });

      return map;
    }
  }

  return null;
};

export const babelPos2vsPos = (pos: any) => {
  const { line, column } = pos;

  return new Position(line - 1, column);
};

export const parseGithubUrl = (repositoryUrl: string) => {
  const uri = Uri.parse(repositoryUrl);

  let url = "";

  if (uri.scheme.match(/^https?$/)) {
    url = repositoryUrl;
  } else {
    url = `https://${uri.authority}${uri.path}`;
  }

  // repository domain
  let domain = uri.authority.split(".")[0];
  domain = domain.charAt(0).toUpperCase() + domain.slice(1);

  return {
    domain,
    url
  };
};
