import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PlaylistRule } from '../rule-based-content-widget.service';

@Component({
  selector: 'kPlaylistRulesListBulkOperationsContent',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class RuleBasedBulkOperationsComponent {
  @Input() selectedRules: PlaylistRule[] = [];
  @Input() rulesTotalCount = 0;
  @Input() duration = 0;

  @Output() addRule = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() deleteRules = new EventEmitter<PlaylistRule[]>();
  @Output() moveRules = new EventEmitter<{ rules: PlaylistRule[], direction: 'up' | 'down' }>();

  constructor(private _appLocalization: AppLocalization) {
  }

  public _moveRules(direction: 'up' | 'down'): void {
    this.moveRules.emit({ rules: this.selectedRules, direction });
  }

  public _getTranslation(key: string, params: string): string {
    return this._appLocalization.get(key, { 0: params });
  }
}

