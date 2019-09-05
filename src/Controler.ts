import {
  window,
  ExtensionContext,
} from "vscode";
import CodeLensProvider from "./subscriber/CodeLensProvider";
import ModuleDescriptionProvider from "./subscriber/ModuleDescriptionProvider";
import ModuleDecorationProvider from './subscriber/ModuleDecorationProvider';

class Controler {
  private context: ExtensionContext;

  private codeLensProvider: CodeLensProvider | undefined;

  constructor(context: ExtensionContext) {
    this.context = context;

    this.initExt();
  }

  private initExt() {
    const language =
      (window.activeTextEditor &&
        window.activeTextEditor.document.languageId) ||
      "";

    // codeLens 模式
    this.codeLensProvider = new CodeLensProvider(
      language
    );
    this.context.subscriptions.push(this.codeLensProvider);

    const moduleDescriptionProvider = new ModuleDescriptionProvider();
    this.context.subscriptions.push(moduleDescriptionProvider);

    const moduleDecorationProvider = new ModuleDecorationProvider();
    this.context.subscriptions.push(moduleDecorationProvider);
  }

  public refresh() {}
}

export default Controler;
