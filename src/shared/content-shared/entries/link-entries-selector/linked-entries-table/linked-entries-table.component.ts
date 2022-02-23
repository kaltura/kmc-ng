import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, HostListener } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'k-linked-entries-table',
  templateUrl: './linked-entries-table.component.html',
  styleUrls: ['./linked-entries-table.component.scss']
})
export class LinkedEntriesTableComponent implements OnInit, OnDestroy, AfterViewInit {

  public _kmcPermissions = KMCPermissions;
  @Input() disabled: boolean;
  @Input() allowMultiple: boolean;
  @Input() selectedEntries: KalturaMediaEntry[] = [];
  @Input()
  set entries(data: any[]) {
    if (!this._deferredLoading) {
      this._entries = [];
      this._cdRef.detectChanges();
      this._entries = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredEntries = data;
    }
  }

  @Output() selectedEntriesChange = new EventEmitter<KalturaMediaEntry[]>();
  @Output() deleteEntry = new EventEmitter<KalturaMediaEntry>();

  @HostListener("window:resize", [])
  onWindowResize() {
    this._documentWidth = document.body.clientWidth;
  }
  public _documentWidth: number = 2000;

  private _deferredEntries: KalturaMediaEntry[];

  public _entries: KalturaMediaEntry[] = [];
  public _emptyMessage: string;
  public _deferredLoading = true;

  public _rowTrackBy(index: number, item: any): string {
    return item.selectionId;
  }

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._documentWidth = document.body.clientWidth;
    this._emptyMessage = this.allowMultiple
      ? this._appLocalization.get('applications.content.entryDetails.metadata.addEntries')
      : this._appLocalization.get('applications.content.entryDetails.metadata.addEntry');
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this._deferredLoading = false;
        this._entries = this._deferredEntries;
        this._deferredEntries = null;
      }, 0);
    }
  }

  ngOnDestroy() {
  }

  public _onSelectionChange(event: KalturaMediaEntry[]): void {
    this.selectedEntriesChange.emit(event);
  }

  public _onThumbLoadError(event): void {
    event.target.style.display = 'none';
  }
}
