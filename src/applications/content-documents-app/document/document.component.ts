import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs';
import { DocumentsStore } from '../documents/documents-store/documents-store.service';
import { KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentDocumentViewSections, ContentDocumentViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { AnalyticsNewMainViewService } from "app-shared/kmc-shared/kmc-views";
import { ActionTypes, NotificationTypes, DocumentStore } from "./document-store.service";
import { DocumentWidgetsManager } from "./document-widgets-manager";
import { DocumentSectionsListWidget } from "./document-sections-list/document-sections-list-widget.service";
import { DocumentDetailsWidget } from "./document-details/document-details-widget.service";
import { DocumentMetadataWidget } from "./document-metadata/document-metadata-widget.service";

@Component({
  selector: 'kDocument',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  providers: [
    DocumentsStore,
    DocumentStore,
    DocumentWidgetsManager,
    DocumentSectionsListWidget,
    DocumentDetailsWidget,
    DocumentMetadataWidget
  ]
})
export class DocumentComponent implements OnInit, OnDestroy {
  public _documentName: string;
  public _currentDocumentId: string;
  public _showLoader = false;
  public _areaBlockerMessage: AreaBlockerMessage;
  public isValid = true;
  public isDirty = true;
  public _analyticsAllowed = false;
  public _enablePrevButton: boolean;
  public _enableNextButton: boolean;

    public get _enableSaveBtn(): boolean {
        return this._documentStore.documentIsDirty; // TODO [kmc] check for room update permissions once added to the backend
    }

  constructor(private _browserService: BrowserService,
              public _documentStore: DocumentStore,
              private _appLocalization: AppLocalization,
              private _DocumentsStore: DocumentsStore,
              private _permissionsService: KMCPermissionsService,
              private _roomWidgetsManager: DocumentWidgetsManager,
              widget1: DocumentSectionsListWidget,
              widget2: DocumentDetailsWidget,
              widget3: DocumentMetadataWidget,
              private _contentDocumentView: ContentDocumentViewService,
              private _analyticsNewMainViewService: AnalyticsNewMainViewService,
              private _router: Router,
              private _roomRoute: ActivatedRoute) {
    _roomWidgetsManager.registerWidgets([widget1, widget2, widget3])
  }

  ngOnInit() {
    let errorMessage;
      this._documentStore.notifications$
          .pipe(cancelOnDestroy(this))
          .subscribe(
              ({ type, error }) => {
                  switch(type) {
                      case NotificationTypes.ViewEntered:
                          const document = this._documentStore.document;
                          if (document ) {
                              this._contentDocumentView.viewEntered({
                                  document,
                                  activatedRoute: this._roomRoute,
                                  section: ContentDocumentViewSections.ResolveFromActivatedRoute
                              });
                          }

                          break;
                      default:
                          break;
                  }
              });

    this._documentStore.state$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        status => {
          this._showLoader = false;
          this._areaBlockerMessage = null;

          if (status) {
            switch (status.action) {
              case ActionTypes.DocumentLoading:
                this._showLoader = true;

                // when loading new room in progress, the 'roomId' property
                // reflect the room that is currently being loaded
                // while 'room$' stream is null
                this._currentDocumentId = this._documentStore.documentId;
                break;

              case ActionTypes.DocumentLoaded:
                this._documentName = this._documentStore.document.name;
                this._analyticsAllowed = this._analyticsNewMainViewService.isAvailable(); // new analytics app is available
                this._updateNavigationState();
                break;

              case ActionTypes.DocumentLoadingFailed:
                errorMessage = status.error
                  ? status.error.message
                  : this._appLocalization.get('applications.content.errors.loadError');
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: errorMessage,
                  buttons: [
                    this._createBackToDocumentsButton(),
                    {
                      label: this._appLocalization.get('applications.content.playlistDetails.errors.retry'),
                      action: () => this._documentStore.reloadDocument()
                    }
                  ]
                });
                break;

              case ActionTypes.DocumentSaving:
                this._showLoader = true;
                break;

              case ActionTypes.DocumentSavingFailed:
                errorMessage = status.error && status.error.message
                  ? status.error.message
                  : this._appLocalization.get('applications.content.playlistDetails.errors.saveError');

                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: errorMessage,
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.ok'),
                    action: () => this._documentStore.reloadDocument()
                  }]
                });
                break;

              case ActionTypes.DocumentDataIsInvalid:
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.playlistDetails.errors.validationError'),
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.dismiss'),
                    action: () => this._areaBlockerMessage = null
                  }]
                });
                break;

              case ActionTypes.ActiveSectionBusy:
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.playlistDetails.errors.busyError'),
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.dismiss'),
                    action: () => this._areaBlockerMessage = null
                  }]
                });
                break;

              case ActionTypes.DocumentPrepareSavingFailed:
                errorMessage = status.error && status.error.message
                  ? status.error.message
                  : this._appLocalization.get('applications.content.playlistDetails.errors.savePrepareError');
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: errorMessage,
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.dismiss'),
                    action: () => this._areaBlockerMessage = null
                  }]
                });
                break;

              default:
                break;
            }
          }
        },
        error => {
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('applications.content.playlistDetails.errors.ok'),
              action: () => this._documentStore.reloadDocument()
            }]
          });
        }
      );



  }

  ngOnDestroy() {
  }

  private _updateNavigationState(): void {
    const rooms = this._DocumentsStore.documents.data().items;
    if (rooms && this._currentDocumentId) {
      const currentDocumentIndex = rooms.findIndex(room => room.id === this._currentDocumentId);
      this._enableNextButton = currentDocumentIndex >= 0 && (currentDocumentIndex < rooms.length - 1);
      this._enablePrevButton = currentDocumentIndex > 0;
    } else {
      this._enableNextButton = false;
      this._enablePrevButton = false;
    }
  }

  private _createBackToDocumentsButton(): AreaBlockerMessageButton {
    return {
      label: this._appLocalization.get('applications.content.rooms.backToRooms'),
      action: () => this._documentStore.returnToDocuments()
    };
  }

  public _backToList(): void {
    this._documentStore.returnToDocuments();
  }

  public save(): void {
    this._documentStore.saveDocument();
  }

  public _navigateToDocument(direction: 'next' | 'prev'): void {
    const rooms = this._DocumentsStore.documents.data().items;
    if (rooms && this._currentDocumentId) {
      const currentDocumentIndex = rooms.findIndex(room => room.id === this._currentDocumentId);
      let newDocument = null;
      if (direction === 'next' && this._enableNextButton) {
          newDocument = rooms[currentDocumentIndex + 1];
      }
      if (direction === 'prev' && this._enablePrevButton) {
          newDocument = rooms[currentDocumentIndex - 1];
      }
      if (newDocument) {
        this._documentStore.openDocument(newDocument);
      }
    }
  }

  public canLeave(): Observable<{ allowed: boolean }> {
    return this._documentStore.canLeaveWithoutSaving();
  }

}
