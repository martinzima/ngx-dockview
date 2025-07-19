import { ApplicationRef, EmbeddedViewRef, Injector, TemplateRef } from '@angular/core';
import { DockviewApi, IDockviewGroupPanel, IWatermarkRenderer, WatermarkRendererInitParameters } from 'dockview-core';

export type TemplateWatermarkRendererProps = {
  group?: IDockviewGroupPanel;
  containerApi: DockviewApi;
};

export class TemplateWatermarkRenderer<C extends TemplateWatermarkRendererProps>
  implements IWatermarkRenderer {
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

  init(props: WatermarkRendererInitParameters): void {
    this.hostElement = document.createElement('div');
    this.hostElement.style.display = 'contents';

    this.embeddedViewRef = this.templateRef.createEmbeddedView({
      group: props.group,
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
