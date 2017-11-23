import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';

@Component({
  selector: 'kSubcategoriesListBulkOperationsContent',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class BulkOperationsComponent {
  @Input() selectedItems: KalturaCategory[] = [];
  @Input() itemsTotalCount = 0;

  @Output() addItem = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() deleteItems = new EventEmitter<KalturaCategory[]>();
  @Output() moveItems = new EventEmitter<{ items: KalturaCategory[], direction: 'up' | 'down' }>();

  constructor(private _appLocalization: AppLocalization) {
  }

  public _moveItems(direction: 'up' | 'down'): void {
    this.moveItems.emit({ items: this.selectedItems, direction });
  }

  public _getTranslation(key: string, params: string): string {
    return this._appLocalization.get(key, { 0: params });
  }
}

