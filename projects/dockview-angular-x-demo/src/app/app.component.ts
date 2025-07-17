import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DockviewComponent, DockviewPanelDirective, DockviewPanelViewType, DockviewViewTemplateDirective } from 'dockview-angular-x';
import { DockviewComponentOptions, themeLight } from 'dockview-core';
import { interval } from 'rxjs';

@Component({
  selector: 'dv-three',
  template: `
    <h1>Three</h1>
    <p>Time: {{params()?.time | date:'mediumTime'}}</p>
  `,
  imports: [DatePipe]
})
export class ThreeComponent {
  readonly params = input<{ time: number }>();
}

@Component({
  selector: 'dv-root',
  template: `
    <h1>dockview-angular-x demo</h1>

    <button (click)="isOneOpen.set(!isOneOpen())">Toggle One</button>
    <button (click)="isTwoOpen.set(!isTwoOpen())">Toggle Two</button>
    <button (click)="addThree()">Add Three</button>

    <dv-dockview style="height: 1000px; width: 100%;"
      [options]="dockviewOptions"
      [viewTypes]="viewTypes">
      <dv-panel id="one" [component]="'one'" [title]="'One'" [(isOpen)]="isOneOpen"
        [params]="params()">
      </dv-panel>

      <dv-panel id="two" [component]="'two'" [title]="'Two'" [(isOpen)]="isTwoOpen"
        [position]="{ direction: 'right' }">
      </dv-panel>

      @for (three of threes(); track three.id) {
        <dv-panel [id]="three.id" [component]="'three'" [title]="'Three'"
          [position]="{ direction: 'right' }"
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
    DockviewPanelDirective,
    DockviewViewTemplateDirective,
    DatePipe
  ]
})
export class AppComponent {
  readonly isOneOpen = signal<boolean>(false);
  readonly isTwoOpen = signal<boolean>(false);
  readonly threes = signal<{ id: string, params: { count: number } }[]>([]);
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
    }
  };

  addThree() {
    this.threes.update(threes => [...threes, { id: `three-${threes.length}`, params: { count: threes.length } }]);
  }
}
