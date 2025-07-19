import { DestroyRef, Directive, inject, Injector, input, model, OnDestroy } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddPanelOptions, AddPanelPositionOptions, Direction, DockviewGroupPanel, FloatingGroupOptions, IDockviewPanel, Parameters } from 'dockview-core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { take } from 'rxjs/operators';
import { DOCKVIEW_INTERFACE } from './dockview-interface';

@Directive({
  selector: 'dv-panel'
})
export class DockviewPanelDirective implements OnDestroy {
  private readonly dockviewInterface = inject(DOCKVIEW_INTERFACE);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private panel: IDockviewPanel | undefined;

  readonly id = input<string>();
  readonly view = input<string>();
  readonly title = input<string>();

  readonly floating = input<FloatingGroupOptions | boolean>(false);
  readonly direction = input<Direction>();
  readonly referencePanel = input<string | IDockviewPanel>();
  readonly referenceGroup = input<string | DockviewGroupPanel>();
  readonly index = input<number>();
  readonly isOpen = model<boolean>(true);
  readonly isActive = model<boolean>(true);
  readonly params = input<Parameters>({});
  readonly initOptions = input<Partial<AddPanelOptions<any>>>({});
  readonly width = input<number>();
  readonly height = input<number>();
  readonly tabComponent = input<string>();

  constructor() {
    outputToObservable(this.dockviewInterface.didRemovePanel)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(panel => {
        if (panel.id === this.id()) {
          this.panel = undefined;
          this.isOpen.set(false);
        }
      });

    outputToObservable(this.dockviewInterface.didActivePanelChange)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(panel => {
        if (this.panel?.api.isActive !== this.isActive() && this.panel) {
          this.isActive.set(this.panel.api.isActive);
        }
      });

    this.dockviewInterface.api$
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(api => {
        explicitEffect([this.isOpen, this.view], ([isOpen, view]) => {
          if (!view) {
            return;
          }
    
          if (isOpen) {
            if (!this.panel) {
              const common: Partial<AddPanelOptions<any>> = {
                id: this.id()!,
                component: this.view()!,
                title: this.title(),
                params: this.params(),
                initialHeight: this.height(),
                initialWidth: this.width(),
                tabComponent: this.tabComponent(),
                inactive: !this.isActive()
              };
              console.log(this.isActive())
              
              if (this.floating()) {
                this.panel = api?.addPanel({
                  ...common as Omit<AddPanelOptions<any>, 'floating' | 'position'>,
                  floating: this.floating(),
                  ...this.initOptions() as Omit<AddPanelOptions<any>, 'floating' | 'position'>
                });
              } else {
                this.panel = api?.addPanel({
                  ...common as Omit<AddPanelOptions<any>, 'floating' | 'position'>,
                  position: {
                    direction: this.direction(),
                    referencePanel: this.referencePanel(),
                    referenceGroup: this.referenceGroup(),
                    index: this.index()
                  } as AddPanelPositionOptions,
                  ...this.initOptions() as Omit<AddPanelOptions<any>, 'floating' | 'position'>
                });
              }
            }
          } else if (this.panel) {
            api?.removePanel(this.panel);
          }
        }, { injector: this.injector as any });
  
        explicitEffect([this.title], ([title]) => {
          this.panel?.setTitle(title || '');
        }, { injector: this.injector as any });

        explicitEffect([this.params], ([params]) => {
          if (params) {
            this.panel?.api.updateParameters(params);
          }
        }, { injector: this.injector as any });
      
        explicitEffect([this.width, this.height], ([width, height]) => {
          if (width || height) {
            this.panel?.api.setSize({ width: width || undefined, height: height || undefined });
          }
        }, { injector: this.injector as any });

        explicitEffect([this.isActive], ([isActive]) => {
          if (isActive) {
            this.panel?.api.setActive();
          }
        }, { injector: this.injector as any });
      });
  }

  ngOnDestroy() {
    this.panel?.dispose();
  }
}
