import { AfterViewInit, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/kmc-shared/columns-resize-manager';
import { TranscodingProfilesTableComponent } from './transcoding-profiles-table.component';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { AppLocalization } from '@kaltura-ng/mc-shared';

@Component({
    selector: 'k-transcoding-media-profiles-table',
    templateUrl: './transcoding-profiles-table.component.html',
    styleUrls: ['./transcoding-profiles-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'transcodingmedia-table' }
    ]
})
export class TranscodingMediaProfilesTableComponent extends TranscodingProfilesTableComponent implements AfterViewInit {
    constructor(protected _appLocalization: AppLocalization,
                protected _permissionsService: KMCPermissionsService,
                protected _cdRef: ChangeDetectorRef,
                private _columnsResizeManager: ColumnsResizeManagerService,
                private _el: ElementRef<HTMLElement>) {
        super(_appLocalization, _permissionsService, _cdRef);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        this._columnsResizeManager.updateColumns(this._el.nativeElement);
    }

    public _onColumnResize(event: { delta: number, element: HTMLTableHeaderCellElement }) {
        this._columnsResizeManager.onColumnResize(event);
    }
}
