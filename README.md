# dockview-angular-x

Dockview bindings for Angular (unofficial). Dockview is a zero dependency Docking Layout Manager for the web, written in TypeScript.

## Installation

```bash
npm install dockview-angular-x dockview-core
```

## Usage

```typescript
import { DockviewComponent, DockviewPanelDirective, DockviewPanelTemplateDirective } from 'dockview-angular-x';

@Component({
  selector: 'app-root',
  template: `
    <dv-dockview style="height: 100%; width: 100%; display: block;"
      (ready)="onReady($event)">
      <!-- declarative approach -->
      <ng-template [dvPanelTemplate]="'one'" let-params>
        <h1>One</h1>
      </ng-template>

      <dv-panel id="one" [view]="'one'" [title]="'One'">
      </dv-panel>
    </dv-dockview>
  `,
  imports: [DockviewComponent, DockviewPanelTemplateDirective, DockviewPanelDirective]
})
export class AppComponent {
  onReady(event: DockviewReadyEvent) {
    // use event.api for imperative approach
  }
}
```

## License

MIT