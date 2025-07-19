import { ApplicationRef, ComponentRef, EnvironmentInjector, Injector, Type, createComponent, inputBinding, reflectComponentType, signal } from '@angular/core';
import { GroupPanelPartInitParameters, IContentRenderer, PanelUpdateEvent, Parameters } from 'dockview-core';

export class ComponentPanelRenderer<T> implements IContentRenderer {
  private readonly params = signal<Parameters>({});
  private componentRef?: ComponentRef<T>;

  constructor(
    private componentType: Type<T>,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
    private applicationRef: ApplicationRef
  ) {}

  get element(): HTMLElement {
    return this.componentRef!.location.nativeElement;
  }

  init(parameters: GroupPanelPartInitParameters): void {
    const hostElement = document.createElement('div');
    hostElement.style.display = 'contents';

    this.params.set(parameters.params);

    const bindings = [];
    const inputNames: Partial<Record<(keyof typeof parameters), () => unknown>> = {
      'params': () => this.params(),
      'api': () => parameters.api,
      'containerApi': () => parameters.containerApi
    };

    for (const inputName of Object.keys(inputNames)) {
      if (parameters[inputName as keyof typeof parameters]
        && reflectComponentType(this.componentType)?.inputs?.some(input => input.propName === inputName)) {
        bindings.push(inputBinding(inputName, inputNames[inputName as keyof typeof inputNames]!));
      }
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

  dispose(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
