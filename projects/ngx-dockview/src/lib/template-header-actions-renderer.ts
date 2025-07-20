import { ApplicationRef, EmbeddedViewRef, Injector, TemplateRef } from '@angular/core';
import { DockviewApi, DockviewGroupPanelApi, IDockviewGroupPanel, IGroupHeaderProps, IHeaderActionsRenderer } from 'dockview-core';

export type TemplateHeaderActionsRendererProps = {
  group: IDockviewGroupPanel;
  api: DockviewGroupPanelApi;
  containerApi: DockviewApi;
};

export class TemplateHeaderActionsRenderer<C extends TemplateHeaderActionsRendererProps>
  implements IHeaderActionsRenderer {
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

  init(props: IGroupHeaderProps): void {
    this.hostElement = document.createElement('div');
    this.hostElement.style.display = 'contents';

    this.embeddedViewRef = this.templateRef.createEmbeddedView({
      group: props.group,
      api: props.api,
      containerApi: props.containerApi
    } as C, this.injector);

    for (const node of this.embeddedViewRef.rootNodes) {
      this.hostElement?.appendChild(node);
    }
    
    this.applicationRef.attachView(this.embeddedViewRef);
    this.embeddedViewRef.detectChanges();
  }

  dispose(): void {
    if (this.embeddedViewRef) {
      this.embeddedViewRef.destroy();
    }
  }
}
