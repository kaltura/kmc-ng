import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
	selector: 'kEntriesTable',
	templateUrl: './entries-table.component.html',
	styleUrls: ['./entries-table.component.scss']
})
export class EntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  public _entries: any[] = [];
  private _deferredEntries : any[];
  public _deferredLoading = true;
  public rowTrackBy: Function = (index: number, item: any) => {return item.id};
  public currentEntryId: string = '';

  @ViewChild('moderationDetails') public moderationDetails: PopupWidgetComponent;

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
    private cdRef: ChangeDetectorRef
  ) {}

  openModerationDetails(entryId): void {
    this.currentEntryId = entryId;
    this.moderationDetails.open();
  }

	ngOnInit() {}

	ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(()=> {
        this._deferredLoading = false;
        this._entries = this._deferredEntries;
        this._deferredEntries = null;
      }, 0);
    }
  }

	ngOnDestroy() {}
}

