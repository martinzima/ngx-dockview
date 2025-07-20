# ngx-dockview

[![npm version](https://img.shields.io/npm/v/ngx-dockview.svg)](https://www.npmjs.com/package/ngx-dockview)
[![npm downloads](https://img.shields.io/npm/dm/ngx-dockview.svg)](https://www.npmjs.com/package/ngx-dockview)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Dockview bindings for Angular (unofficial). Dockview is a zero dependency Docking Layout Manager for the web, written in TypeScript.

## Installation

```bash
# npm

npm install ngx-dockview dockview-core

# yarn

yarn add ngx-dockview dockview-core

# pnpm

pnpm add ngx-dockview dockview-core
```

## Usage

```typescript
import { DockviewComponent, DockviewPanelDirective, DockviewPanelTemplateDirective } from 'ngx-dockview';

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

For more elaborate example showing more features of the library, please see the [demo](projects/ngx-dockview-demo/src/app/app.component.ts).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.