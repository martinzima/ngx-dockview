import { ApplicationRef, ComponentRef, EnvironmentInjector, Injector, Type, createComponent, inputBinding, reflectComponentType, signal } from '@angular/core';
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
    private environmentInjector: EnvironmentInjector,
    private applicationRef: ApplicationRef
  ) {}

  init(parameters: GroupPanelPartInitParameters): void {
    const hostElement = document.createElement('div');
    hostElement.style.display = 'contents';

    const bindings = [];

    this.params.set(parameters.params);

    if (parameters.params
      && reflectComponentType(this.componentType)?.inputs?.some(input => input.propName === 'params')) {
      bindings.push(inputBinding('params', () => this.params()));
    }

    this.componentRef = createComponent(this.componentType, {
      elementInjector: this.injector,
      hostElement,
      environmentInjector: this.environmentInjector,
      bindings
    });
    
    this.applicationRef.attachView(this.componentRef.hostView);
    this.componentRef.changeDetectorRef.detectChanges();
  }

  update(event: PanelUpdateEvent<Parameters>): void {
    if (this.componentRef) {
      this.params.set(event.params);
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }
}
