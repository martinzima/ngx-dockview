import { AfterViewInit, ApplicationRef, ChangeDetectionStrategy, Component, contentChildren, DestroyRef, ElementRef, EnvironmentInjector, forwardRef, inject, Injector, input, output, TemplateRef, Type, viewChild } from '@angular/core';
import { CreateComponentOptions, createDockview, DockviewApi, DockviewComponentOptions, DockviewDndOverlayEvent, DockviewGroupPanel, DockviewReadyEvent, IContentRenderer, IDockviewPanel, ITabRenderer, MovePanelEvent, Parameters } from 'dockview-core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { ComponentPanelRenderer } from './component-panel-renderer';
import { ComponentTabRenderer } from './component-tab-renderer';
import { DOCKVIEW_INTERFACE, DockviewInterface } from './dockview-interface';
import { DockviewPanelTemplateDirective } from './panel-template.directive';
import { DockviewTabTemplateDirective } from './tab-template.directive';
import { TemplatePanelRenderer } from './template-panel-renderer';
import { TemplateTabRenderer } from './template-tab-renderer';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DOCKVIEW_INTERFACE,
      useExisting: forwardRef(() => DockviewComponent)
    }
  ]
})
export class DockviewComponent implements DockviewInterface, AfterViewInit {
  private _api$ = new BehaviorSubject<DockviewApi | undefined>(undefined);

  private readonly disposables: IDisposable[] = [];

  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly applicationRef = inject(ApplicationRef);
  private readonly dockviewElement = viewChild<ElementRef<HTMLDivElement>>('dockview');
  private readonly panelTemplates = contentChildren(DockviewPanelTemplateDirective);
  private readonly tabTemplates = contentChildren(DockviewTabTemplateDirective);

  readonly viewTypes = input<Record<string, DockviewPanelViewType>>();
  readonly tabComponentTypes = input<Record<string, DockviewPanelViewType>>();
  readonly options = input<Partial<DockviewComponentOptions>>();
  readonly defaultTabComponent = input<Type<any>>();

  readonly didRemoveGroup = output<DockviewGroupPanel>();
  readonly didRemovePanel = output<IDockviewPanel>();
  readonly didActiveGroupChange = output<DockviewGroupPanel | undefined>();
  readonly didActivePanelChange = output<IDockviewPanel | undefined>();
  readonly didMovePanel = output<MovePanelEvent>();
  readonly unhandledDragOverEvent = output<DockviewDndOverlayEvent>();
  readonly ready = output<DockviewReadyEvent>();

  get api(): DockviewApi | undefined {
    return this._api$.value;
  }

  get api$(): Observable<DockviewApi | undefined> {
    return this._api$.asObservable().pipe(filter(api => !!api));
  }

  constructor() {
    inject(DestroyRef)
      .onDestroy(() => {
        this.disposables.forEach(disposable => disposable.dispose());
      });
  }

  ngAfterViewInit() {
    const api = createDockview(this.dockviewElement()!.nativeElement, {
      createComponent: this.createComponent,
      createTabComponent: this.createTabComponent,
      ...this.options()
    });

    // without this, the requested initial panel sizes are lost on the first auto-resize
    api.layout(this.dockviewElement()!.nativeElement.clientWidth,
      this.dockviewElement()!.nativeElement.clientHeight);

    this._api$.next(api);

    this.ready.emit({ api: this.api! });

    this.disposables.push(this.api!.onDidRemoveGroup(e => this.didRemoveGroup.emit(e)));
    this.disposables.push(this.api!.onDidRemovePanel(e => this.didRemovePanel.emit(e)));
    this.disposables.push(this.api!.onDidActiveGroupChange(e => this.didActiveGroupChange.emit(e)));
    this.disposables.push(this.api!.onDidActivePanelChange(e => this.didActivePanelChange.emit(e)));
    this.disposables.push(this.api!.onDidMovePanel(e => this.didMovePanel.emit(e)));
    this.disposables.push(this.api!.onUnhandledDragOverEvent(e => this.unhandledDragOverEvent.emit(e)));
  }

  private createComponent = (options: CreateComponentOptions): IContentRenderer => {
    const viewType = this.getPanelViewType(options.name);
    if (viewType) {
      if ('template' in viewType) {
        return new TemplatePanelRenderer(viewType.template, this.injector, this.applicationRef);
      } else {
        return new ComponentPanelRenderer(viewType.component, this.injector, this.environmentInjector, this.applicationRef);
      }
    }

    throw new Error(`Unknown panel type: ${options.name}`);
  };

  private createTabComponent = (options: CreateComponentOptions): ITabRenderer | undefined => {
    const viewType = this.getTabViewType(options.name);
    if (viewType) {
      if ('template' in viewType) {
        return new TemplateTabRenderer(viewType.template, this.injector, this.applicationRef);
      } else {
        return new ComponentTabRenderer(viewType.component, this.injector, this.environmentInjector, this.applicationRef);
      }
    }

    return undefined;
  };

  private getPanelViewType(name: string): DockviewPanelViewType {
    const template = this.panelTemplates().find((template) => template.name() === name);
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

  private getTabViewType(name: string): DockviewPanelViewType | null {
    const template = this.tabTemplates().find((template) => template.name() === name);
    if (template) {
      return template;
    }

    const viewTypes = this.tabComponentTypes();
    if (viewTypes) {
      const type = viewTypes[name];
      if (type) {
        return type;
      }
    }

    return null;
  }
}

