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

  @Output() selectedFieldsChange = new EventEmitter<any>();
  @Output() actionSelected = new EventEmitter<MetadataItem>();

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor() {
  }

  public _onSelectionChange(event: MetadataItem[]): void {
    this.selectedFieldsChange.emit(event);
  }
}

