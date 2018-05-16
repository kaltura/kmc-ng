import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlaylistRule } from '../playlist-rule/playlist-rule.interface';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

@Component({
  selector: 'kPlaylistRulesListBulkOperationsContent',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class RuleBasedBulkOperationsComponent {
  @Input() selectedRules: PlaylistRule[] = [];
  @Input() rulesTotalCount = 0;
  @Input() duration = 0;
  @Input() entriesTotalCount = 0;
  @Input() isNewPlaylist: boolean;

  @Output() addRule = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() deleteRules = new EventEmitter<PlaylistRule[]>();
  @Output() moveRules = new EventEmitter<{ rules: PlaylistRule[], direction: 'up' | 'down' }>();

  public _kmcPermissions = KMCPermissions;

  public _moveRules(direction: 'up' | 'down'): void {
    this.moveRules.emit({ rules: this.selectedRules, direction });
  }
}

