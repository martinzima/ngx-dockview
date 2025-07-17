import { ApplicationRef, createComponent, EnvironmentInjector, Injector, Type, ViewRef } from '@angular/core';
import { DockviewPanelApi, IDockviewPanelHeaderProps, ITabRenderer } from 'dockview-core';

export class ComponentTabRenderer<T> implements ITabRenderer {
  private _element: HTMLElement;
  private viewRef?: ViewRef;

  get element(): HTMLElement {
    return this._element;
  }

  constructor(
    private readonly component: Type<T>,
    private readonly injector: Injector,
    private readonly environmentInjector: EnvironmentInjector
  ) {
    this._element = document.createElement('div');
    this._element.style.height = '100%';
    this._element.style.width = '100%';
  }

  init(props: IDockviewPanelHeaderProps): void {
    const componentRef = createComponent(this.component, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
      hostElement: this._element,
    });

    const appRef = this.injector.get(ApplicationRef);
    appRef.attachView(componentRef.hostView);

    for (const key in props) {
      componentRef.setInput(key, (props as any)[key]);
    }

    componentRef.changeDetectorRef.detectChanges();

    this.viewRef = componentRef.hostView;
  }

  dispose(): void {
    if (this.viewRef) {
      this.viewRef.destroy();
    }
  }
}
