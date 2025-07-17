import { ComponentRef, EnvironmentInjector, Injector, Type, createComponent, inputBinding, signal } from '@angular/core';
import { GroupPanelPartInitParameters, IContentRenderer, PanelUpdateEvent, Parameters } from 'dockview-core';

export class ComponentPanelRenderer<T> implements IContentRenderer {
  private readonly params = signal<Parameters>({});
  private componentRef?: ComponentRef<T>;

  get element(): HTMLElement {
    return this.componentRef!.location.nativeElement;
  }

  constructor(
    private componentType: Type<T>,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector
  ) {}

  init(parameters: GroupPanelPartInitParameters): void {
    const hostElement = document.createElement('div');
    this.componentRef = createComponent(this.componentType, {
      elementInjector: this.injector,
      hostElement,
      environmentInjector: this.environmentInjector,
      bindings: [
        inputBinding('params', () => this.params())
      ]
    });
    this.componentRef.changeDetectorRef.detectChanges();
  }

  update(event: PanelUpdateEvent<Parameters>): void {
    if (this.componentRef) {
      this.params.set(event.params);
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }
}
