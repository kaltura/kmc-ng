import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { PlaylistRule, RuleBasedContentWidget } from '../rule-based-content-widget.service';

@Component({
  selector: 'kPlaylistRulesTable',
  templateUrl: './playlist-rules-table.component.html',
  styleUrls: ['./playlist-rules-table.component.scss']
})
export class PlaylistRulesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;

  @Input() set isNewPlaylist(value) {
    if (value) {
      this.assignEmptyMessage();
    }
  };
  @Input() selectedRules: PlaylistRule[] = [];
  @Input() filter: any = {};

  @Input()
  set rules(data: any[]) {
    if (!this._deferredLoading) {
      this._rules = [];
      this._cdRef.detectChanges();
      this._rules = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredRules = data
    }
  }

  @Output() sortChanged = new EventEmitter<any>();
  @Output() selectedRulesChange = new EventEmitter<any>();
  @Output() onActionSelected = new EventEmitter<{ action: string, rule: PlaylistRule }>();

  private _deferredRules: PlaylistRule[];
  public _rules: PlaylistRule[] = [];
  public _emptyMessage: string;
  public _deferredLoading = true;
  public _items: MenuItem[];

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef,
              private _widgetService: RuleBasedContentWidget,
              private _router: Router) {
  }

  ngOnInit() {
    let loadedOnce = false;

    this._widgetService.state$
      .cancelOnDestroy(this)
      .subscribe(
        result => {
          if (!result.error) {
            if (result.loading) {
              this._emptyMessage = '';
              loadedOnce = true;
            } else {
              if (loadedOnce) {
                this.assignEmptyMessage();
              }
            }
          }
        },
        error => {
          console.warn('[kmcng] -> could not load rules'); // navigate to error page
          throw error;
        });
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this._deferredLoading = false;
        this._rules = this._deferredRules;
        this._deferredRules = null;
      }, 0);
    }
  }

  ngOnDestroy() {
  }

  private _buildMenu(rowIndex: number, rule: PlaylistRule): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.content.bulkActions.removeFromPlaylist'),
        command: () => this.onActionSelected.emit({ action: 'remove', rule: rule })
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.moveUp'),
        command: (event) => this.onActionSelected.emit({ action: 'moveUp', rule: rule }),
        disabled: rowIndex === 0
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.moveDown'),
        command: () => this.onActionSelected.emit({ action: 'moveDown', rule: rule }),
        disabled: rowIndex + 1 === this._rules.length
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.duplicate'),
        command: () => this.onActionSelected.emit({ action: 'duplicate', rule: rule })
      }
    ];
  }

  public _onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  public _openActionsMenu(event: any, rowIndex: number, rule: PlaylistRule) {
    if (this.actionsMenu) {
      this._buildMenu(rowIndex, rule);
      this.actionsMenu.toggle(event);
      this.actionsMenu.show(event);
    }
  }

  public _onSelectionChange(event) {
    this.selectedRulesChange.emit(event);
  }

  public assignEmptyMessage(): void {
    this._emptyMessage = this._appLocalization.get('applications.content.playlistDetails.errors.addAtLeastOneMedia');
  }
}

