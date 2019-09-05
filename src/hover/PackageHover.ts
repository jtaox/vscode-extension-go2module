import { Hover, MarkdownString, Uri } from "vscode";
import { IDependenceLink } from "./../lib/parse";

class PackageHover extends Hover {
  constructor(contents: MarkdownString, links: IDependenceLink[]) {
    super(contents);
    this.linkToMarkdown(contents, links);
  }

  private linkToMarkdown(contents: MarkdownString, links: IDependenceLink[]) {
    if (links.length) {
      contents.appendMarkdown("\n\n");
    }
    links.forEach(link => {
      const url = Uri.parse(
        `command:extension-openbrowser?${encodeURIComponent(
          JSON.stringify({ url: link.url })
        )}`
      );

      contents.appendMarkdown(
        `[\`${link.title}\`](${url})&nbsp;`
      );
    });
    contents.isTrusted = true;

    return contents;
  }
}

export default PackageHover;
