import { Component, HostBinding, HostListener, input, signal } from '@angular/core';
import { DockviewPanelApi, IDockviewPanelHeaderProps } from 'dockview-core';
import { effectOnceIf } from 'ngxtension/effect-once-if';
import { TabCloseIconComponent } from './tab-close-icon.component';

@Component({
  selector: 'dv-default-tab',
  imports: [TabCloseIconComponent],
  template: `
    <span class="dv-default-tab-content">{{ title() }}</span>
    @if (!hideClose() && tabLocation() !== 'headerOverflow') {
      <div
        class="dv-default-tab-action"
        (pointerdown)="onActionPointerDown($event)"
        (click)="onClose($event)">
        <dv-tab-close-icon />
      </div>
    }
  `
})
export class DockviewDefaultTabComponent {
  protected readonly title = signal<string | undefined>(undefined);

  private _isMiddleMouseButton = false;

  readonly api = input<DockviewPanelApi>();
  readonly hideClose = input<boolean>(false);
  readonly closeActionOverride = input<() => void>();
  readonly tabLocation = input<IDockviewPanelHeaderProps['tabLocation']>();

  @HostBinding('class.dv-default-tab') isDefaultTab = true;

  constructor() {
    effectOnceIf(() => this.api(), api => {
      this.title.set(api.title);

      api.onDidTitleChange(({ title }) => {
        this.title.set(title);
      });

      this.title.set(this.api()?.title);
    });
  }

  onClose(event: MouseEvent): void {
    event.preventDefault();

    if (this.closeActionOverride()) {
      this.closeActionOverride()!();
    } else {
      this.api()?.close();
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
