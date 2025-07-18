import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DockviewComponent, DockviewGroupDirective, DockviewPanelDirective, DockviewPanelViewType, DockviewViewTemplateDirective } from 'dockview-angular-x';
import { DockviewComponentOptions, themeLight } from 'dockview-core';
import { interval } from 'rxjs';

@Component({
  selector: 'dv-three',
  template: `
    <h1>Three</h1>
    <p>Time: {{params()?.time | date:'mediumTime'}}</p>
  `,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreeComponent {
  readonly params = input<{ time: number }>();
}

@Component({
  selector: 'dv-four',
  template: `
    <h1>Four</h1>
    <button type="button" (click)="count.set(count() + 1)">Count: {{count()}}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FourComponent {
  readonly count = signal(0);
}

@Component({
  selector: 'dv-root',
  template: `
    <h1>dockview-angular-x demo</h1>

    <button (click)="isOneOpen.set(!isOneOpen())">Toggle One</button>
    <button (click)="isTwoOpen.set(!isTwoOpen())">Toggle Two</button>
    <button (click)="addThree()">Add Three</button>
    <button (click)="addFour()">Add Four</button>

    <dv-dockview style="height: 1000px; width: 100%;"
      [options]="dockviewOptions"
      [viewTypes]="viewTypes">
      <dv-group id="left" [direction]="'left'" [locked]="true">
      </dv-group>

      <dv-group id="right" [direction]="'right'">
      </dv-group>

      <dv-group id="bottom" [direction]="'below'" [height]="100">
      </dv-group>

      <dv-panel id="one" [view]="'one'" [title]="'One'" [(isOpen)]="isOneOpen"
        [referenceGroup]="'left'" [params]="params()">
      </dv-panel>

      <dv-panel id="two" [view]="'two'" [title]="'Two'" [(isOpen)]="isTwoOpen"
        [referenceGroup]="'right'">
      </dv-panel>

      @for (three of threes(); track three.id) {
        <dv-panel [id]="three.id" [view]="'three'" [title]="'Three'"
          [referenceGroup]="'bottom'"
          [params]="params()">
        </dv-panel>
      }

      @for (four of fours(); track four.id) {
        <dv-panel [id]="four.id" [view]="'four'" [title]="'Four'"
          [referenceGroup]="'right'" [direction]="'right'"
          [params]="params()">
        </dv-panel>
      }

      <ng-template [dvViewTemplate]="'one'" let-params>
        <h1>One</h1>
        <p>Time: {{params.time | date:'mediumTime'}}</p>
      </ng-template>

      <ng-template [dvViewTemplate]="'two'">
        <h1>Two</h1>
      </ng-template>
    </dv-dockview>
  `,
  styles: `
    :host {
      height: 100%;
      width: 100%;
      display: block;
    }
  `,
  imports: [
    DockviewComponent,
    DockviewGroupDirective,
    DockviewPanelDirective,
    DockviewViewTemplateDirective,
    DatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly isOneOpen = signal<boolean>(false);
  readonly isTwoOpen = signal<boolean>(false);
  readonly threes = signal<{ id: string, params: { count: number } }[]>([]);
  readonly fours = signal<{ id: string, params: {} }[]>([]);
  readonly time = signal<number>(Date.now());
  readonly params = computed(() => ({ time: this.time() }));
  
  constructor() {
    interval(1000).pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => {
        this.time.set(Date.now());
      });
  }

  readonly dockviewOptions: Partial<DockviewComponentOptions> = {
    theme: themeLight
  };

  readonly viewTypes: Record<string, DockviewPanelViewType> = {
    three: {
      component: ThreeComponent
    },
    four: {
      component: FourComponent
    }
  };

  addThree() {
    this.threes.update(threes => [...threes, { id: `three-${threes.length}`, params: { count: threes.length } }]);
  }

  addFour() {
    this.fours.update(fours => [...fours, { id: `four-${fours.length}`, params: {} }]);
  }
}
