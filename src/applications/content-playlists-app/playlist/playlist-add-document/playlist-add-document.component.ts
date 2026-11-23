import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import {
  DocumentsListAction,
  KalturaClient,
  KalturaDetachedResponseProfile,
  KalturaDocumentEntry,
  KalturaDocumentEntryFilter,
  KalturaEntryStatus,
  KalturaEntryType,
  KalturaFilterPager,
  KalturaObjectBaseFactory,
  KalturaResponseProfileType
} from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { getDocumentThumbnailClass } from 'app-shared/content-shared/document-thumbnail/document-thumbnail';

// a document picker used to add document entries to a manual playlist
@Component({
  selector: 'kAddDocument',
  templateUrl: './playlist-add-document.component.html',
  styleUrls: ['./playlist-add-document.component.scss']
})
export class PlaylistAddDocumentComponent implements OnInit, OnDestroy {
  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onAddDocuments = new EventEmitter<KalturaDocumentEntry[]>();

  public _kmcPermissions = KMCPermissions;
  public _documents: KalturaDocumentEntry[] = [];
  public _selectedDocuments: KalturaDocumentEntry[] = [];
  public _totalCount = 0;
  public _freeText = '';
  public _pageSize = 25;
  public _pageIndex = 0;
  public _isBusy = false;
  public _errorMessage: string = null; // k-area-blocker shows any string (even empty) as an error
  public _addButtonLabel = '';
  public _ks: string;
  public _loadThumbnailWithKs: boolean;
  public _getDocumentThumbnailClass = getDocumentThumbnailClass;

  private _addButtonLabelTranslation = '';
  private _querySubscription: ISubscription;

  // same statuses allowed when adding media entries to a playlist
  private _allowedStatuses = [
    KalturaEntryStatus.preconvert,
    KalturaEntryStatus.ready,
    KalturaEntryStatus.noContent,
    KalturaEntryStatus.moderate,
    KalturaEntryStatus.blocked
  ].join(',');

  constructor(private _kalturaClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private _appAuthentication: AppAuthentication) {
    this._addButtonLabelTranslation = this._addButtonLabel = this._appLocalization.get('applications.content.playlists.addToPlaylist');
  }

  ngOnInit() {
    this._ks = this._appAuthentication.appUser.ks;
    this._loadThumbnailWithKs = this._appAuthentication.appUser.partnerInfo.loadThumbnailWithKs;
    this._loadDocuments();
  }

  ngOnDestroy() {
    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
    }
  }

  private _loadDocuments(): void {
    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
    }

    this._isBusy = true;
    this._errorMessage = null;

    const filter = new KalturaDocumentEntryFilter({
      typeEqual: KalturaEntryType.document,
      statusIn: this._allowedStatuses,
      orderBy: '-createdAt'
    });
    if (this._freeText.trim()) {
      filter.freeText = this._freeText.trim();
    }

    this._querySubscription = this._kalturaClient.request(new DocumentsListAction({
      filter,
      pager: new KalturaFilterPager({ pageSize: this._pageSize, pageIndex: this._pageIndex + 1 })
    }).setRequestOptions({
      responseProfile: new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'id,name,thumbnailUrl,createdAt,status,type,documentType'
      })
    }))
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          this._isBusy = false;
          this._documents = response.objects || [];
          this._totalCount = response.totalCount || 0;
        },
        error => {
          this._isBusy = false;
          this._documents = [];
          this._totalCount = 0;
          this._errorMessage = error?.message || this._appLocalization.get('applications.content.playlists.errorLoadingDocuments');
        });
  }

  public _search(): void {
    this._pageIndex = 0;
    this._loadDocuments();
  }

  public _onPaginationChanged(state: { page: number, rows: number }): void {
    if (state.page !== this._pageIndex || state.rows !== this._pageSize) {
      this._pageIndex = state.page;
      this._pageSize = state.rows;
      this._loadDocuments();
    }
  }

  public _addToBucket(document: KalturaDocumentEntry): void {
    // clone the document so the same document can be added more than once (like media entries)
    this._selectedDocuments.push(<KalturaDocumentEntry>Object.assign(KalturaObjectBaseFactory.createObject(document), document));
    this._updateAddButtonLabel();
  }

  public _removeFromBucket(document: KalturaDocumentEntry): void {
    this._selectedDocuments.splice(this._selectedDocuments.indexOf(document), 1);
    this._updateAddButtonLabel();
  }

  private _updateAddButtonLabel(): void {
    this._addButtonLabel = this._selectedDocuments.length > 0
      ? `${this._addButtonLabelTranslation} ${this._selectedDocuments.length}`
      : this._addButtonLabelTranslation;
  }

  public _onThumbLoadError(event, holder: HTMLDivElement): void {
    event.target.style.display = 'none';
    holder.classList.add('showIcon');
  }

  public _addDocuments(): void {
    this.onAddDocuments.emit(this._selectedDocuments);
    this.onClosePopupWidget.emit();
  }
}
