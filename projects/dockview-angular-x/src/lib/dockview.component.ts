import { AfterViewInit, Component, contentChildren, DestroyRef, ElementRef, EnvironmentInjector, inject, Injector, input, output, TemplateRef, Type, viewChild } from '@angular/core';
import { CreateComponentOptions, createDockview, DockviewApi, DockviewComponentOptions, DockviewGroupPanel, IContentRenderer, IDockviewPanel, Parameters } from 'dockview-core';
import { ComponentPanelRenderer } from './component-panel-renderer';
import { DockviewViewTemplateDirective } from './dockview-view-template.directive';
import { TemplatePanelRenderer } from './template-panel-renderer';

// dockview-core does not export IDisposable
interface IDisposable {
  dispose(): void;
}

export interface DockviewComponentPanelViewType<T> {
  component: Type<T>;
}

export interface DockviewTemplatePanelViewType<C extends { $implicit: Parameters }> {
  template: TemplateRef<C>;
}

export type DockviewPanelViewType = DockviewComponentPanelViewType<unknown> | DockviewTemplatePanelViewType<any>;

@Component({
  selector: 'dv-dockview',
  imports: [],
  template: ` <div #dockview style="height: 100%; width: 100%; display: block;"></div>`,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class DockviewComponent implements AfterViewInit {
  private _api?: DockviewApi;

  private readonly disposables: IDisposable[] = [];

  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly dockview = viewChild<ElementRef<HTMLDivElement>>('dockview');
  private readonly viewTemplates = contentChildren(DockviewViewTemplateDirective);

  readonly viewTypes = input<Record<string, DockviewPanelViewType>>();
  readonly options = input<Partial<DockviewComponentOptions>>();
  readonly defaultTabComponent = input<Type<any>>();

  readonly didRemoveGroup = output<DockviewGroupPanel>();
  readonly didRemovePanel = output<IDockviewPanel>();

  get api(): DockviewApi | undefined {
    return this._api;
  }

  constructor() {
    inject(DestroyRef)
      .onDestroy(() => {
        this.disposables.forEach(disposable => disposable.dispose());
      });
  }

  ngAfterViewInit() {
    this._api = createDockview(this.dockview()!.nativeElement, {
      createComponent: this.createComponent,
      ...this.options(),
    });

    this.disposables.push(this._api.onDidRemoveGroup(e => this.didRemoveGroup.emit(e)));
    this.disposables.push(this._api.onDidRemovePanel(e => this.didRemovePanel.emit(e)));
  }

  private createComponent = (options: CreateComponentOptions): IContentRenderer => {
    const viewType = this.getPanelViewType(options.name);
    if (viewType) {
      if ('template' in viewType) {
        return new TemplatePanelRenderer(viewType.template, this.injector);
      } else {
        return new ComponentPanelRenderer(viewType.component, this.injector, this.environmentInjector);
      }
    }

    throw new Error(`Unknown panel type: ${options.name}`);
  };

  private getPanelViewType(name: string): DockviewPanelViewType {
    const template = this.viewTemplates().find((template) => template.name() === name);
    if (template) {
      return template;
    }

    const viewTypes = this.viewTypes();
    if (viewTypes) {
      const type = viewTypes[name];
      if (type) {
        return type;
      }
    }

    throw new Error(`Unknown panel type: ${name}`);
  }
}

