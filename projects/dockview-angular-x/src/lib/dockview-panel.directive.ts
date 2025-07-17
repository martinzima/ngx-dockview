import { afterNextRender, DestroyRef, Directive, inject, Injector, input, model, OnDestroy } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddPanelPositionOptions, FloatingGroupOptions, IDockviewPanel, Parameters } from 'dockview-core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { DockviewComponent } from './dockview.component';

@Directive({
  selector: 'dv-panel'
})
export class DockviewPanelDirective implements OnDestroy {
  private panel: IDockviewPanel | undefined;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input<string>();
  readonly component = input<string>();
  readonly title = input<string>();

  readonly floating = input<FloatingGroupOptions | boolean>(false);
  readonly position = input<AddPanelPositionOptions>();
  readonly isOpen = model<boolean>(true);
  readonly params = input<Parameters>({});

  constructor(private dockview: DockviewComponent) {
    afterNextRender(() => {
      outputToObservable(this.dockview.didRemovePanel)
        .pipe(
          takeUntilDestroyed(this.destroyRef))
        .subscribe(panel => {
          if (panel.id === this.id()) {
            this.panel = undefined;
            this.isOpen.set(false);
          }
        });

      explicitEffect([this.isOpen, this.component], ([isOpen, component]) => {
        if (!component) {
          return;
        }
  
        if (isOpen) {
          if (!this.panel) {
            const common = {
              id: this.id()!,
              component: this.component()!,
              title: this.title(),
              params: this.params()
            };
            
            if (this.floating()) {
              this.panel = this.dockview.api?.addPanel({
                ...common,
                floating: this.floating()
              });
            } else {
              this.panel = this.dockview.api?.addPanel({
                ...common,
                position: this.position()
              });
            }
          }
        } else if (this.panel) {
          this.panel.api.close();
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
    })
    
  }

  ngOnDestroy() {
    this.panel?.dispose();
  }
}
