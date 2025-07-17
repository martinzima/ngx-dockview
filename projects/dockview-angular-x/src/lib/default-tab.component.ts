import { Component, HostBinding, HostListener, input, OnInit, signal } from '@angular/core';
import { DockviewPanelApi, IDockviewPanelHeaderProps } from 'dockview-core';

@Component({
  selector: 'dv-default-tab',
  standalone: true,
  template: `
    <span class="dv-default-tab-content">{{ title() }}</span>
    @if (!hideClose() && tabLocation() !== 'headerOverflow') {
      <div
        class="dv-default-tab-action"
        (pointerdown)="onActionPointerDown($event)"
        (click)="onClose($event)"
      >
        <svg
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M6 6L18 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      padding: 0 8px;
      height: 100%;
      cursor: pointer;
    }

    .dv-default-tab-content {
      padding: 0 4px;
    }

    .dv-default-tab-action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;

      &:hover {
        background-color: var(--dv-active-selection-background-color);
      }
    }
  `,
})
export class DockviewDefaultTabComponent implements OnInit {
  private _isMiddleMouseButton = false;

  readonly api = input.required<DockviewPanelApi>();
  readonly hideClose = input<boolean>(false);
  readonly closeActionOverride = input<() => void>();
  readonly tabLocation = input<IDockviewPanelHeaderProps['tabLocation']>();

  readonly title = signal<string | undefined>(undefined);

  @HostBinding('class.dv-default-tab') isDefaultTab = true;

  constructor() {
    const api = this.api();
    this.title.set(api.title);

    api.onDidTitleChange(({ title }) => {
      this.title.set(title);
    });
  }

  ngOnInit(): void {
    // required to get the initial title if it's set after instantiation
    this.title.set(this.api().title);
  }

  onClose(event: MouseEvent): void {
    event.preventDefault();

    if (this.closeActionOverride()) {
      this.closeActionOverride()!();
    } else {
      this.api().close();
    }
  }

  onActionPointerDown(event: PointerEvent): void {
    event.preventDefault();
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    this._isMiddleMouseButton = event.button === 1;
  }

  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (this._isMiddleMouseButton && event.button === 1 && !this.hideClose()) {
      this.onClose(event);
    }
    this._isMiddleMouseButton = false;
  }

  @HostListener('pointerleave', ['$event'])
  onPointerLeave(event: PointerEvent): void {
    this._isMiddleMouseButton = false;
  }
}
