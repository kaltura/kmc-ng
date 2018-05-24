import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { MetadataItem } from 'app-shared/kmc-shared/custom-metadata/metadata-profile';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'kCustomSchemaFieldsTable',
  templateUrl: './custom-schema-fields-table.component.html',
  styleUrls: ['./custom-schema-fields-table.component.scss']
})
export class CustomSchemaFieldsTableComponent implements AfterViewInit {
  @Input() set fields(data: MetadataItem[]) {
    if (!this._deferredLoading) {
      this._fields = [];
      this._cdRef.detectChanges();
      this._fields = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredFields = data
    }
  }

  @Input() isNew: boolean;
  @Input() selectedFields: MetadataItem[] = [];

  @Output() selectedFieldsChange = new EventEmitter<MetadataItem[]>();
  @Output() onActionSelected = new EventEmitter<{ action: string, payload: { field: MetadataItem, direction?: 'up' | 'down' } }>();

  private _deferredFields: MetadataItem[] = [];

  public _fields: MetadataItem[] = [];
  public _deferredLoading = true;
  public _kmcPermissions = KMCPermissions;

  public rowTrackBy: Function = (index: number, item: any) => item.id;

  constructor(private _cdRef: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._fields = this._deferredFields;
        this._deferredFields = null;
      }, 0);
    }
  }

  public _onSelectionChange(event: MetadataItem[]): void {
    this.selectedFieldsChange.emit(event);
  }

  public _moveField(field: MetadataItem, direction: 'up' | 'down'): void {
    this.onActionSelected.emit({
      action: 'move',
      payload: {
        direction,
        field
      }
    })
  }

  public _removeField(field: MetadataItem): void {
    this.onActionSelected.emit({ action: 'remove', payload: { field } });
  }

  public _editField(field: MetadataItem): void {
    this.onActionSelected.emit({ action: 'edit', payload: { field } });
  }
}

