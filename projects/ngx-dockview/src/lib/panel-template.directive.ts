import { Directive, input, TemplateRef } from "@angular/core";
import { DockviewApi, DockviewPanelApi, Parameters } from "dockview-core";
import { DockviewTemplatePanelViewType } from "./dockview.component";

@Directive({
  selector: '[dvPanelTemplate]'
})
export class DockviewPanelTemplateDirective<C extends { $implicit: Parameters, api: DockviewPanelApi, containerApi: DockviewApi }> implements DockviewTemplatePanelViewType<C> {
  constructor (public template: TemplateRef<C>) {
  }

  readonly name = input<string>(undefined, { alias: 'dvPanelTemplate' });
}
