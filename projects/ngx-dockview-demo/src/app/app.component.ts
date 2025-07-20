import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DockviewPanelApi, themeLight } from 'dockview-core';
import { DockviewComponent, DockviewDefaultTabComponent, DockviewGroupDirective, DockviewPanelDirective, DockviewPanelTemplateDirective, DockviewPanelViewType, DockviewTabTemplateDirective } from 'ngx-dockview';
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
    <button type="button" (click)="add()">Count: {{count()}}</button>
    <button type="button" (click)="api()?.close()">Close</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FourComponent {
  readonly api = input<DockviewPanelApi>();
  protected readonly count = signal(0);

  add() {
    this.count.set(this.count() + 1);
  }
}

@Component({
  selector: 'dv-root',
  template: `
    <h1>ngx-dockview demo</h1>

    <div style="margin-bottom: 16px;">
      <button (click)="isOneOpen.set(!isOneOpen())">Toggle One</button>
      <button (click)="isTwoOpen.set(!isTwoOpen())">Toggle Two</button>
      <button (click)="addThree()">Add Three</button>
      <button (click)="addFour()">Add Four</button>
    </div>

    <dv-dockview style="flex-grow: 1; width: 100%;"
      [theme]="themeLight"
      [viewTypes]="viewTypes"
      [tabComponentTypes]="tabComponentTypes"
      [prefixHeaderActionsTemplate]="prefixHeaderActionsTemplate"
      [watermarkTemplate]="watermarkTemplate">
      <ng-template #prefixHeaderActionsTemplate>
        <div style="line-height: 35px; padding: 0 8px;">LOGO</div>
      </ng-template>

      <ng-template #watermarkTemplate>
        <div style="height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; font-size: 18px; color: gray;">
          Empty state
        </div>
      </ng-template>

      <dv-group id="left" [direction]="'left'">
      </dv-group>

      <dv-group id="right" [direction]="'right'">
      </dv-group>

      <dv-group id="bottom" [direction]="'below'" [height]="200">
      </dv-group>

      <ng-template [dvPanelTemplate]="'one'" let-params>
        <h1>One</h1>
        <p>Time: {{params.time | date:'mediumTime'}}</p>
      </ng-template>

      <ng-template [dvPanelTemplate]="'two'" let-api="api">
        <h1>Two</h1>
        <button type="button" (click)="api?.close()">Close</button>
      </ng-template>

      <ng-template [dvTabTemplate]="'customTab1'" let-params let-api="api" let-title="title">
        <dv-default-tab [api]="api" [title]="title" [hideClose]="true" />
      </ng-template>

      <dv-panel id="one" [view]="'one'" [title]="'One'" [(isOpen)]="isOneOpen"
        [referenceGroup]="'left'" [params]="params()" [tabComponent]="'default'" [width]="200">
      </dv-panel>

      <dv-panel id="two" [view]="'two'" [title]="'Two'" [(isOpen)]="isTwoOpen"
        [referenceGroup]="'right'" [tabComponent]="'customTab1'">
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
          [width]="200"
          [params]="params()">
        </dv-panel>
      }
    </dv-dockview>
  `,
  styles: `
    :host {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  `,
  imports: [
    DockviewComponent,
    DockviewGroupDirective,
    DockviewPanelDirective,
    DockviewPanelTemplateDirective,
    DockviewTabTemplateDirective,
    DatePipe,
    DockviewDefaultTabComponent
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

  readonly themeLight = themeLight;

  readonly viewTypes: Record<string, DockviewPanelViewType> = {
    three: {
      component: ThreeComponent
    },
    four: {
      component: FourComponent
    }
  };

  readonly tabComponentTypes: Record<string, DockviewPanelViewType> = {
    default: {
      component: DockviewDefaultTabComponent
    }
  };

  addThree() {
    this.threes.update(threes => [...threes, { id: `three-${threes.length}`, params: { count: threes.length } }]);
  }

  addFour() {
    this.fours.update(fours => [...fours, { id: `four-${fours.length}`, params: {} }]);
  }
}
