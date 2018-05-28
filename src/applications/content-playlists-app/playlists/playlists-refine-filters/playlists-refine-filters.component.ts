import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { subApplicationsConfig } from 'config/sub-applications';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { PlaylistsFilters, PlaylistsStore } from '../playlists-store/playlists-store.service';

const listOfFilterNames: (keyof PlaylistsFilters)[] = ['createdAt'];

@Component({
  selector: 'k-playlists-refine-filters',
  templateUrl: './playlists-refine-filters.component.html',
  styleUrls: ['./playlists-refine-filters.component.scss']
})
export class PlaylistsRefineFiltersComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;

  public _createdAfter: Date;
  public _createdBefore: Date;
  public _createdAtFilterError: string = null;
  public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;

  constructor(private _store: PlaylistsStore,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._prepare();
  }

  // keep for cancelOnDestroy operator
  ngOnDestroy() {
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._store.cloneFilters(listOfFilterNames));
  }

  private _updateComponentState(updates: Partial<PlaylistsFilters>): void {
    if (typeof updates.createdAt !== 'undefined') {
      this._createdAfter = updates.createdAt.fromDate || null;
      this._createdBefore = updates.createdAt.toDate || null;
      this._createdAtFilterError = null;
    }
  }


  private _registerToFilterStoreDataChanges(): void {
    this._store.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(
        ({ changes }) => {
          this._updateComponentState(changes);
        }
      );
  }

  private _prepare(): void {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
  }

  /**
   * Clear all content components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearAllComponents(): void {
    this._store.resetFilters(listOfFilterNames);
  }

  public _onCreatedChanged(): void {
    const updateResult = this._store.filter({
      createdAt: {
        fromDate: this._createdAfter,
        toDate: this._createdBefore
      }
    });

    if (updateResult.createdAt && updateResult.createdAt.failed) {
      this._createdAtFilterError = this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError');

      setTimeout(() => {
        const createdAt = this._store.cloneFilter('createdAt', null);
        this._createdAfter = createdAt ? createdAt.fromDate : null;
        this._createdBefore = createdAt ? createdAt.toDate : null;

      }, 0);
    } else {
      this._createdAtFilterError = null;
    }
  }

  /**
   * Invoke a request to the popup widget container to close the popup widget.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _close() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
