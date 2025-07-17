import { Directive, input, TemplateRef } from "@angular/core";
import { Parameters } from "dockview-core";
import { DockviewTemplatePanelViewType } from "./dockview.component";

@Directive({
  selector: '[dvViewTemplate]'
})
export class DockviewViewTemplateDirective<C extends { $implicit: Parameters }> implements DockviewTemplatePanelViewType<C> {
  constructor (public template: TemplateRef<C>) {
  }

  readonly name = input<string>(undefined, { alias: 'dvViewTemplate' });
}
