import { DestroyRef, Directive, inject, Injector, input, model, OnDestroy, signal } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddGroupOptions, Direction, DockviewGroupPanel, IDockviewGroupPanel, IDockviewPanel } from 'dockview-core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { take } from 'rxjs';
import { DOCKVIEW_INTERFACE } from './dockview-interface';

type AddGroupOptionsWithPanel = {
    referencePanel: string | IDockviewPanel;
    direction?: Omit<Direction, 'within'>;
};
type AddGroupOptionsWithGroup = {
    referenceGroup: string | DockviewGroupPanel;
    direction?: Omit<Direction, 'within'>;
};

type AbsolutePosition = {
  direction: Omit<Direction, 'within'>;
};

export type AddGroupPositionOptions = AddGroupOptionsWithGroup | AddGroupOptionsWithPanel | AbsolutePosition;

@Directive({
  selector: 'dv-group'
})
export class DockviewGroupDirective implements OnDestroy {
  private group = signal<IDockviewGroupPanel | undefined>(undefined);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dockviewInterface = inject(DOCKVIEW_INTERFACE);

  readonly id = input<string>();
  readonly isOpen = model<boolean>(true);
  readonly isVisible = model<boolean>(true);
  readonly isActive = model<boolean>(true);
  readonly referencePanel = input<string | IDockviewPanel>();
  readonly direction = input<Direction>();
  readonly referenceGroup = input<string | DockviewGroupPanel>();
  readonly initOptions = input<Partial<AddGroupOptions>>({});
  readonly locked = input<boolean>(false);
  readonly width = input<number>();
  readonly height = input<number>();

  constructor() {
    outputToObservable(this.dockviewInterface.didAddGroup)
      .pipe(
        takeUntilDestroyed(this.destroyRef))
      .subscribe(group => {
        if (group.id === this.id()) {
          this.group.set(group);
          this.isOpen.set(true);
        }
      });

    outputToObservable(this.dockviewInterface.didRemovePanel)
      .pipe(
        takeUntilDestroyed(this.destroyRef))
      .subscribe(panel => {
        if (panel.id === this.id()) {
          this.group.set(undefined);
          this.isOpen.set(false);
        }
      });

    outputToObservable(this.dockviewInterface.didActiveGroupChange)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(group => {
        if (this.group() && this.group()!.api.isActive !== this.isActive()) {
          this.isActive.set(this.group()!.api.isActive);
        }
      });

    this.dockviewInterface.api$
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(api => {
        explicitEffect([this.isOpen], ([isOpen]) => {
          if (isOpen) {
            if (!this.group()) {
              const common: Partial<AddGroupOptions> = {
                id: this.id()!,
                referencePanel: this.referencePanel(),
                direction: this.direction(),
                referenceGroup: this.referenceGroup(),
                locked: this.locked(),
                initialHeight: this.height(),
                initialWidth: this.width(),
                skipSetActive: !this.isActive()
              };
              
              this.group.set(api?.addGroup({
                ...common,
                ...this.initOptions() as AddGroupOptions
              }));
            }
          } else if (this.group()) {
            this.group()!.api.close();
          }
        }, { injector: this.injector as any });

        explicitEffect([this.isVisible], ([isVisible]) => {
          this.group()?.api.setVisible(isVisible);
        }, { injector: this.injector as any });

        explicitEffect([this.width, this.height], ([width, height]) => {
          if (width || height) {
            this.group()?.api.setSize({ width: width || undefined, height: height || undefined });
          }
        }, { injector: this.injector as any });
      });
  }

  ngOnDestroy() {
    this.group()?.api.close();
  }
}
