import { ApplicationRef, EmbeddedViewRef, Injector, TemplateRef } from '@angular/core';
import { GroupPanelPartInitParameters, IContentRenderer, PanelUpdateEvent, Parameters } from 'dockview-core';

export class TemplatePanelRenderer<C extends { $implicit: Parameters }> implements IContentRenderer {
  private hostElement?: HTMLElement;
  private embeddedViewRef?: EmbeddedViewRef<C>;

  get element(): HTMLElement {
    return this.hostElement!;
  }

  constructor(
    private template: TemplateRef<C>,
    private injector: Injector,
    private applicationRef: ApplicationRef
  ) {}

  init(parameters: GroupPanelPartInitParameters): void {
    this.hostElement = document.createElement('div');
    this.hostElement.style.display = 'contents';
    
    this.embeddedViewRef = this.template.createEmbeddedView({
      $implicit: parameters.params
    } as C, this.injector);

    for (const node of this.embeddedViewRef.rootNodes) {
      this.hostElement?.appendChild(node);
    }
    
    this.applicationRef.attachView(this.embeddedViewRef);
    this.embeddedViewRef.detectChanges();
  }

  update(event: PanelUpdateEvent<Parameters>): void {
    if (this.embeddedViewRef) {
      this.embeddedViewRef.context.$implicit = event.params;
      this.embeddedViewRef.detectChanges();
    }
  }
}
