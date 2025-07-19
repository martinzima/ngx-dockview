import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injector, inputBinding, reflectComponentType, signal, Type } from '@angular/core';
import { IDockviewPanelHeaderProps, ITabRenderer, PanelUpdateEvent, Parameters } from 'dockview-core';

export class ComponentTabRenderer<T> implements ITabRenderer {
  private readonly params = signal<Parameters>({});
  
  private componentRef?: ComponentRef<T>;

  constructor(
    private readonly componentType: Type<T>,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
    private applicationRef: ApplicationRef
  ) {
  }

  get element(): HTMLElement {
    return this.componentRef!.location.nativeElement;
  }

  init(props: IDockviewPanelHeaderProps): void {
    const hostElement = document.createElement('div');

    this.componentRef = createComponent(this.componentType, {
      elementInjector: this.injector,
      hostElement,
      environmentInjector: this.environmentInjector
    });

    this.params.set(props.params);
    
    const bindings = [];
    const inputNames: Partial<Record<(keyof typeof props), () => unknown>> = {
      'params': () => this.params(),
      'api': () => props.api,
      'tabLocation': () => props.tabLocation,
      'containerApi': () => props.containerApi
    };

    for (const inputName of Object.keys(inputNames)) {
      if (props[inputName as keyof typeof props]
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
