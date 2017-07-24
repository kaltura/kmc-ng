import { Component, Input, Output,	EventEmitter,	AfterViewInit, OnInit, OnDestroy,	ViewChild, ChangeDetectorRef } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { PlaylistStore } from '../playlist-store.service';
import { DataTable } from 'primeng/primeng';

@Component({
	selector: 'kPlaylistEntriesTable',
	templateUrl: './playlist-entries-table.component.html',
	styleUrls: ['./playlist-entries-table.component.scss']
})
export class PlaylistEntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
	public _entries: any[] = [];
  private _deferredEntries : any[];
  public _deferredLoading = true;
  public _areaBlockerMessage: AreaBlockerMessage;

  @ViewChild('dataTable') private dataTable: DataTable;

  @Input() filter: any = {};
  @Output() sortChanged = new EventEmitter<any>();
  @Input() set entries(data: any[]) {
    if (!this._deferredLoading) {
      this._entries = [];
      this.cdRef.detectChanges();
      this._entries = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredEntries = data
    }
  }

	constructor(
		private _appLocalization: AppLocalization,
    public _playlistStore: PlaylistStore,
		private cdRef: ChangeDetectorRef
	) {}

	ngOnInit() {
    this._areaBlockerMessage = null;
    this._playlistStore.entriesState$
      .cancelOnDestroy(this)
      .subscribe(
      response => {
        if (response.error) {
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: response.error.message,
            buttons: [{
              label: this._appLocalization.get('applications.content.playlistDetails.errors.retry'),
              action: () => {
                this._playlistStore.reloadPlaylist();
              }
            }]
          });
        }
      }
    );
	}

  onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  scrollToTop() {
    const scrollBodyArr = this.dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
    if (scrollBodyArr && scrollBodyArr.length > 0) {
      const scrollBody: HTMLDivElement = scrollBodyArr[0];
      scrollBody.scrollTop = 0;
    }
  }

	ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(()=> {
        this._deferredLoading = false;
        this._entries = this._deferredEntries;
        this._deferredEntries = null;
      }, 0);
    }
	}

	ngOnDestroy() {

	}
}

