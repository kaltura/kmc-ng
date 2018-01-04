import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

@Component({
  selector: 'kCustomSchemaFieldsTable',
  templateUrl: './custom-schema-fields-table.component.html',
  styleUrls: ['./custom-schema-fields-table.component.scss']
})
export class CustomSchemaFieldsTableComponent {
  @Input() fields: any[];

  @Input() selectedFields: any[] = [];

  @Output() selectedFieldsChange = new EventEmitter<any>();
  @Output() actionSelected = new EventEmitter<any>();

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor(private _appLocalization: AppLocalization) {
  }

  public _onSelectionChange(event): void {
    this.selectedFieldsChange.emit(event);
  }
}

