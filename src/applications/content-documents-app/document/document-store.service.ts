import {Host, Injectable, OnDestroy} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, EMPTY, Observable, Subject, timer} from 'rxjs';
import {ISubscription} from 'rxjs/Subscription';
import {
    DocumentsGetAction, DocumentsUpdateAction,
    KalturaClient, KalturaDocumentEntry,
    KalturaMultiRequest,
    KalturaObjectBaseFactory
} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AppAuthentication, BrowserService} from 'app-shared/kmc-shell';
import {DocumentsStore} from '../documents/documents-store/documents-store.service';
import {DocumentWidgetsManager} from './document-widgets-manager';
import {OnDataSavingReasons} from '@kaltura-ng/kaltura-ui';
import {PageExitVerificationService} from 'app-shared/kmc-shell/page-exit-verification';
import {
    ContentDocumentViewService,
    ContentDocumentViewSections
} from 'app-shared/kmc-shared/kmc-views/details-views';
import {cancelOnDestroy, tag} from '@kaltura-ng/kaltura-common';
import {debounce, filter, map, switchMap} from 'rxjs/operators';
import {ContentDocumentsMainViewService} from "app-shared/kmc-shared/kmc-views";

export enum ActionTypes {
  DocumentLoading,
  DocumentLoaded,
  DocumentLoadingFailed,
  DocumentSaving,
  DocumentPrepareSavingFailed,
  DocumentSavingFailed,
  DocumentDataIsInvalid,
  ActiveSectionBusy
}
export enum NotificationTypes {
    ViewEntered
}
export interface StatusArgs {
  action: ActionTypes;
  error?: Error;
}

@Injectable()
export class DocumentStore implements OnDestroy {
    private _notifications = new Subject<{ type: NotificationTypes, error?: Error }>();
    public notifications$ = this._notifications.asObservable();
  private _loadDocumentSubscription: ISubscription;
  private _sectionToRouteMapping: { [key: number]: string } = {};
  private _state = new BehaviorSubject<StatusArgs>({ action: ActionTypes.DocumentLoading, error: null });
  private _documentIsDirty = false;
  private _saveDocumentInvoked = false;
  private _documentId: string;
  private _document = new BehaviorSubject<{ document: KalturaDocumentEntry}>({ document: null });
  private _pageExitVerificationToken: string;

  public state$ = this._state.asObservable();

  private _getDocumentId(): string {
    return this._documentRoute.snapshot.params.id ? this._documentRoute.snapshot.params.id : null;
  }

  public get document(): KalturaDocumentEntry {
    return this._document.getValue().document;
  }

  public get documentId(): string {
    return this._documentId;
  }

  public get documentIsDirty(): boolean {
    return this._documentIsDirty;
  }

  constructor(private _router: Router,
              private _documentRoute: ActivatedRoute,
              private _appAuth: AppAuthentication,
              private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _documentsStore: DocumentsStore,
              private _contentDocumentView: ContentDocumentViewService,
              private _contentDocumentsMainView: ContentDocumentsMainViewService,
              private _pageExitVerificationService: PageExitVerificationService,
              @Host() private _widgetsManager: DocumentWidgetsManager) {
    this._widgetsManager.documentStore = this;
    this._mapSections();
    this._onSectionsStateChanges();
    this._onRouterEvents();
  }

  ngOnDestroy() {
    this._document.complete();
    this._state.complete();

    if (this._pageExitVerificationToken) {
      this._pageExitVerificationService.remove(this._pageExitVerificationToken);
    }

    if (this._loadDocumentSubscription) {
      this._loadDocumentSubscription.unsubscribe();
    }

    if (this._saveDocumentInvoked) {
      this._documentsStore.reload();
    }
  }

  private _onSectionsStateChanges(): void {
    this._widgetsManager.widgetsState$
      .pipe(cancelOnDestroy(this))
      .pipe(debounce(() => timer(500)))
      .subscribe(
        sectionsState => {
          const newDirtyState = Object.keys(sectionsState)
            .reduce((result, sectionName) => result || sectionsState[sectionName].isDirty, false);

          if (newDirtyState && this._documentIsDirty !== newDirtyState) {
            this._documentIsDirty = newDirtyState;

            this._updatePageExitVerification();
          }
        }
      );
  }

  private _updatePageExitVerification(): void {
    if (this._documentIsDirty) {
      this._pageExitVerificationToken = this._pageExitVerificationService.add();
    } else {
      if (this._pageExitVerificationToken) {
        this._pageExitVerificationService.remove(this._pageExitVerificationToken);
      }
      this._pageExitVerificationToken = null;
    }
  }

  private _loadDocument(id: string): void {
    if (this._loadDocumentSubscription) {
      this._loadDocumentSubscription.unsubscribe();
      this._loadDocumentSubscription = null;
    }

    this._documentId = id;
    this._documentIsDirty = false;
    this._updatePageExitVerification();

    this._state.next({ action: ActionTypes.DocumentLoading });
    this._widgetsManager.notifyDataLoading(id);

    if (!id) {
      return this._state.next({ action: ActionTypes.DocumentLoadingFailed, error: new Error('Missing documentId') });
    }

    const request = new DocumentsGetAction({ entryId: id });

    this._loadDocumentSubscription = this._kalturaServerClient
      .request(request)
      .pipe(cancelOnDestroy(this))
      .subscribe((document: KalturaDocumentEntry) => {
              this._document.next({ document });
              this._notifications.next({ type: NotificationTypes.ViewEntered });

              if (this._contentDocumentView.isAvailable({
              document,
              activatedRoute: this._documentRoute,
              section: ContentDocumentViewSections.ResolveFromActivatedRoute
          })) {

              this._loadDocumentSubscription = null;

              const documentLoadedResult = this._widgetsManager.notifyDataLoaded(document, { isNewData: false });
              if (documentLoadedResult.errors.length) {
                  this._state.next({
                      action: ActionTypes.DocumentLoadingFailed,
                      error: new Error('one of the widgets failed while handling data loaded event')
                  });
              } else {
                  this._state.next({ action: ActionTypes.DocumentLoaded });
              }
          }
        },
        error => {
          this._loadDocumentSubscription = null;
          this._state.next({ action: ActionTypes.DocumentLoadingFailed, error });
        }
      );
  }

  private _mapSections(): void {
    if (!this._documentRoute || !this._documentRoute.snapshot.data.documentRoute) {
      throw new Error('this service can be injected from component that is associated to the document route');
    }

    this._documentRoute.snapshot.routeConfig.children.forEach(childRoute => {
      const routeSectionType = childRoute.data ? childRoute.data.sectionKey : null;

      if (routeSectionType !== null) {
        if (Array.isArray(routeSectionType)) {
          routeSectionType.forEach(type => {
            this._sectionToRouteMapping[type] = childRoute.path;
          });
        } else {
          this._sectionToRouteMapping[routeSectionType] = childRoute.path;
        }
      }
    });
  }

  private _onRouterEvents(): void {
    this._router.events
      .pipe(cancelOnDestroy(this))
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(
        () => {
          const currentDocumentId = this._documentRoute.snapshot.params.id;
          if (currentDocumentId !== this._documentId) {
              setTimeout(() => this._loadDocument(currentDocumentId), 0);
          }
        }
      );
  }

  public saveDocument(): void {
    if (this.document) {
      const newDocument = <KalturaDocumentEntry>KalturaObjectBaseFactory.createObject(this.document);
      const id = this._getDocumentId();
      const action = new DocumentsUpdateAction({entryId: id, documentEntry: newDocument});
      const request = new KalturaMultiRequest(action);

      this._widgetsManager.notifyDataSaving(newDocument, request, this.document)
        .pipe(cancelOnDestroy(this))
        .pipe(tag('block-shell'))
        .pipe(switchMap((response: { ready: boolean, reason?: OnDataSavingReasons, errors?: Error[] }) => {
            if (response.ready) {
              this._saveDocumentInvoked = true;

              return this._kalturaServerClient.multiRequest(request)
                .pipe(tag('block-shell'))
                .pipe(map(([res]) => {
                    if (res.error) {
                      this._state.next({ action: ActionTypes.DocumentSavingFailed });
                    } else {
                      if (id === 'new') {
                        this._documentIsDirty = false;
                          this._contentDocumentView.open({ document: res.result, section: ContentDocumentViewSections.Metadata });
                      } else {
                        this._loadDocument(this.documentId);
                      }
                    }

                    return EMPTY;
                  }
                ))
            } else {
              switch (response.reason) {
                case OnDataSavingReasons.validationErrors:
                  this._state.next({ action: ActionTypes.DocumentDataIsInvalid });
                  break;
                case OnDataSavingReasons.attachedWidgetBusy:
                  this._state.next({ action: ActionTypes.ActiveSectionBusy });
                  break;
                case OnDataSavingReasons.buildRequestFailure:
                  this._state.next({ action: ActionTypes.DocumentPrepareSavingFailed });
                  break;
              }

              return EMPTY;
            }
          }
        ))
        .subscribe(
          response => {
            // do nothing - the service state is modified inside the map functions.
          },
          error => {
            this._state.next({ action: ActionTypes.DocumentSavingFailed, error });
          }
        );
    } else {
      console.error(new Error(`Failed to create a new instance of the document type '${this.document ? typeof this.document : 'n/a'}`));
      this._state.next({ action: ActionTypes.DocumentPrepareSavingFailed });
    }
  }

  public reloadDocument(): void {
    if (this._getDocumentId()) {
      this._loadDocument(this.documentId);
    }
  }

  public openSection(sectionKey: ContentDocumentViewSections): void {
     this._contentDocumentView.open({ section: sectionKey, document: this.document });
  }

  public openDocument(document: KalturaDocumentEntry) {
    if (this.documentId !== document.id) {
      this.canLeaveWithoutSaving()
            .pipe(
                filter(({ allowed }) => allowed),
                cancelOnDestroy(this)
            )
            .subscribe(() => {
                this._contentDocumentView.open({ document, section: ContentDocumentViewSections.Metadata });
            });
    }
  }

  public canLeaveWithoutSaving(): Observable<{ allowed: boolean }> {
    return Observable.create(observer => {
      if (this._documentIsDirty) {
        this._browserService.confirm(
          {
            header: 'Cancel Edit',
            message: 'Discard all changes?',
            accept: () => {
              this._documentIsDirty = false;
              observer.next({ allowed: true });
              observer.complete();
            },
            reject: () => {
              observer.next({ allowed: false });
              observer.complete();
            }
          }
        );
      } else {
        observer.next({ allowed: true });
        observer.complete();
      }
    });
  }

  public returnToDocuments(): void {
    this.canLeaveWithoutSaving()
      .pipe(cancelOnDestroy(this))
      .pipe(filter(({ allowed }) => allowed))
      .subscribe(() => {
          this._contentDocumentsMainView.open();
      });
  }
}
