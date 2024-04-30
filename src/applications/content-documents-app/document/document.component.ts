import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs';
import { DocumentsStore } from '../documents/documents-store/documents-store.service';
import { ContentDocumentViewSections, ContentDocumentViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { AnalyticsNewMainViewService } from "app-shared/kmc-shared/kmc-views";
import { ActionTypes, NotificationTypes, DocumentStore } from "./document-store.service";
import { DocumentWidgetsManager } from "./document-widgets-manager";
import { DocumentSectionsListWidget } from "./document-sections-list/document-sections-list-widget.service";
import { DocumentDetailsWidget } from "./document-details/document-details-widget.service";
import { DocumentMetadataWidget } from "./document-metadata/document-metadata-widget.service";
import { DocumentThumbnailsWidget } from './document-thumbnails/document-thumbnails-widget.service';
import { DocumentAccessControlWidget } from './document-access-control/document-access-control-widget.service';
import { DocumentSchedulingWidget } from './document-scheduling/document-scheduling-widget.service';
import { DocumentRelatedWidget } from './document-related/document-related-widget.service';
import { DocumentUsersWidget } from './document-users/document-users-widget.service';
import { CustomMenuItem } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import { KalturaDocumentEntry, KalturaEntryStatus } from 'kaltura-ngx-client';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import {AppAuthentication} from 'app-shared/kmc-shell';

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
    DocumentMetadataWidget,
    DocumentThumbnailsWidget,
    DocumentAccessControlWidget,
    DocumentSchedulingWidget,
    DocumentRelatedWidget,
    DocumentUsersWidget
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
    public _items: CustomMenuItem[] = [
        {
            label: this._appLocalization.get('applications.content.table.download'),
            commandName: 'download',
            styleClass: ''
        },
        {
            label: this._appLocalization.get('applications.content.table.delete'),
            commandName: 'delete',
            styleClass: 'kDanger'
        }
    ];
  public _menuItems: CustomMenuItem[] = [];

    public get _enableSaveBtn(): boolean {
        return this._documentStore.documentIsDirty; // TODO [kmc] check for room update permissions once added to the backend
    }

  constructor(private _browserService: BrowserService,
              public _documentStore: DocumentStore,
              private _documentsStore: DocumentsStore,
              private _appLocalization: AppLocalization,
              private _appAuthentication: AppAuthentication,
              private _DocumentsStore: DocumentsStore,
              private _logger: KalturaLogger,
              widget1: DocumentSectionsListWidget,
              widget2: DocumentDetailsWidget,
              widget3: DocumentMetadataWidget,
              widget4: DocumentThumbnailsWidget,
              widget5: DocumentAccessControlWidget,
              widget6: DocumentSchedulingWidget,
              widget7: DocumentRelatedWidget,
              widget8: DocumentUsersWidget,
              private _contentDocumentView: ContentDocumentViewService,
              private _permissionsService: KMCPermissionsService,
              private _analyticsNewMainViewService: AnalyticsNewMainViewService,
              private _documentRoute: ActivatedRoute,
              _documentWidgetsManager: DocumentWidgetsManager) {
    _documentWidgetsManager.registerWidgets([widget1, widget2, widget3, widget4, widget5, widget6, widget7, widget8])
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
                                  activatedRoute: this._documentRoute,
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

                // when loading new document in progress, the 'documentId' property
                // reflect the document that is currently being loaded
                // while 'document' stream is null
                this._currentDocumentId = this._documentStore.documentId;
                break;

              case ActionTypes.DocumentLoaded:
                this._documentName = this._documentStore.document.name;
                this._analyticsAllowed = this._analyticsNewMainViewService.isAvailable(); // new analytics app is available
                this._updateNavigationState();
                this._buildMenu(this._documentStore.document);
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

    private _buildMenu(document: KalturaDocumentEntry): void {
        this._menuItems = this._items
            .map(item => {
                switch (item.commandName) {
                    case 'delete':
                        item.command = () => {
                            this._browserService.confirm({
                                header: this._appLocalization.get('applications.content.documents.deleteDocument'),
                                message: this._appLocalization.get('applications.content.documents.confirmDeleteSingle', {0: document.name}),
                                accept: () => this._deleteDocument(document.id)
                            });
                        };
                        break;
                    case 'download':
                        item.command = () => this._browserService.openLink(document.downloadUrl + '/ks/' + this._appAuthentication.appUser.ks);
                        item.disabled = document.status !== KalturaEntryStatus.ready || !this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_DOWNLOAD);
                        break;
                    default:
                        break;
                }
                return item;
            });
    }

    private _deleteDocument(documentId: string): void {
        this._documentsStore.deleteDocument(documentId)
            .pipe(cancelOnDestroy(this))
            .pipe(tag('block-shell'))
            .subscribe(
                () => {
                    this._showLoader = true;
                    setTimeout(() => {
                        this._documentsStore.reload();
                        this._showLoader = false;
                    }, 1000);

                },
                error => {
                    this._areaBlockerMessage = new AreaBlockerMessage({
                        message: error.message,
                        buttons: [
                            {
                                label: this._appLocalization.get('app.common.retry'),
                                action: () => {
                                    this._areaBlockerMessage = null;
                                    this._deleteDocument(documentId);
                                }
                            },
                            {
                                label: this._appLocalization.get('app.common.cancel'),
                                action: () => {
                                    this._areaBlockerMessage = null;
                                }
                            }
                        ]
                    });
                }
            );
    }

  private _updateNavigationState(): void {
    const documents = this._DocumentsStore.documents.data().items;
    if (documents && this._currentDocumentId) {
      const currentDocumentIndex = documents.findIndex(room => room.id === this._currentDocumentId);
      this._enableNextButton = currentDocumentIndex >= 0 && (currentDocumentIndex < documents.length - 1);
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
