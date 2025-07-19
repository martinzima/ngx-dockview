import { ApplicationRef, EmbeddedViewRef, Injector, TemplateRef } from '@angular/core';
import { DockviewApi, DockviewPanelApi, IDockviewPanelHeaderProps, ITabRenderer, PanelUpdateEvent, Parameters } from 'dockview-core';

export class TemplateTabRenderer<C extends { $implicit: Parameters, api: DockviewPanelApi, containerApi: DockviewApi }>
  implements ITabRenderer {
  private hostElement?: HTMLElement;
  private embeddedViewRef?: EmbeddedViewRef<C>;

  constructor(
    private templateRef: TemplateRef<C>,
    private injector: Injector,
    private applicationRef: ApplicationRef
  ) {
  }

  get element(): HTMLElement {
    return this.hostElement!;
  }

  init(props: IDockviewPanelHeaderProps): void {
    this.hostElement = document.createElement('div');
    this.hostElement.style.display = 'contents';

    this.embeddedViewRef = this.templateRef.createEmbeddedView({
      $implicit: props.params,
      api: props.api,
      containerApi: props.containerApi
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

  dispose(): void {
    if (this.embeddedViewRef) {
      this.embeddedViewRef.destroy();
    }
  }
}
