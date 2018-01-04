import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MetadataItem } from 'app-shared/kmc-shared/custom-metadata/metadata-profile';

@Component({
  selector: 'kCustomSchemaFieldsTable',
  templateUrl: './custom-schema-fields-table.component.html',
  styleUrls: ['./custom-schema-fields-table.component.scss']
})
export class CustomSchemaFieldsTableComponent {
  @Input() fields: MetadataItem[];
  @Input() selectedFields: MetadataItem[] = [];

  @Output() selectedFieldsChange = new EventEmitter<MetadataItem[]>();
  @Output() onActionSelected = new EventEmitter<{ action: string, payload: { field: MetadataItem, direction?: 'up' | 'down' } }>();

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor() {
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

