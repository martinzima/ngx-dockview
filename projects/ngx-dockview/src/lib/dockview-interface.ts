import { InjectionToken, OutputRef } from "@angular/core";
import { DockviewApi, DockviewDndOverlayEvent, DockviewGroupPanel, DockviewReadyEvent, IDockviewPanel, MovePanelEvent } from "dockview-core";
import { Observable } from "rxjs";

export interface DockviewInterface {
  readonly api: DockviewApi | undefined;
  readonly api$: Observable<DockviewApi | undefined>;
  readonly ready: OutputRef<DockviewReadyEvent>;
  readonly didAddPanel: OutputRef<IDockviewPanel>;
  readonly didAddGroup: OutputRef<DockviewGroupPanel>;
  readonly didRemovePanel: OutputRef<IDockviewPanel>;
  readonly didRemoveGroup: OutputRef<DockviewGroupPanel>;
  readonly didActiveGroupChange: OutputRef<DockviewGroupPanel | undefined>;
  readonly didActivePanelChange: OutputRef<IDockviewPanel | undefined>;
  readonly didMovePanel: OutputRef<MovePanelEvent>;
  readonly unhandledDragOverEvent: OutputRef<DockviewDndOverlayEvent>;
}

export const DOCKVIEW_INTERFACE = new InjectionToken<DockviewInterface>('DockviewInterface');
