import {Host, Injectable, OnDestroy} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, EMPTY, Observable, Subject, timer} from 'rxjs';
import {ISubscription} from 'rxjs/Subscription';
import {
    KalturaClient,
    KalturaMultiRequest,
    KalturaObjectBaseFactory,
    KalturaRoomEntry,
    RoomGetAction, RoomUpdateAction
} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AppAuthentication, BrowserService} from 'app-shared/kmc-shell';
import {RoomsStore} from '../rooms/rooms-store/rooms-store.service';
import {RoomWidgetsManager} from './room-widgets-manager';
import {OnDataSavingReasons} from '@kaltura-ng/kaltura-ui';
import {PageExitVerificationService} from 'app-shared/kmc-shell/page-exit-verification';
import {ContentRoomViewSections, ContentRoomViewService} from 'app-shared/kmc-shared/kmc-views/details-views';
import {cancelOnDestroy, tag} from '@kaltura-ng/kaltura-common';
import {debounce, filter, map, switchMap} from 'rxjs/operators';
import {ContentRoomsMainViewService} from "app-shared/kmc-shared/kmc-views";

export enum ActionTypes {
  RoomLoading,
  RoomLoaded,
  RoomLoadingFailed,
  RoomSaving,
  RoomPrepareSavingFailed,
  RoomSavingFailed,
  RoomDataIsInvalid,
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
export class RoomStore implements OnDestroy {
    private _notifications = new Subject<{ type: NotificationTypes, error?: Error }>();
    public notifications$ = this._notifications.asObservable();
  private _loadRoomSubscription: ISubscription;
  private _sectionToRouteMapping: { [key: number]: string } = {};
  private _state = new BehaviorSubject<StatusArgs>({ action: ActionTypes.RoomLoading, error: null });
  private _roomIsDirty = false;
  private _saveRoomInvoked = false;
  private _roomId: string;
  private _room = new BehaviorSubject<{ room: KalturaRoomEntry }>({ room: null });
  private _pageExitVerificationToken: string;

  public state$ = this._state.asObservable();

  private _getRoomId(): string {
    return this._roomRoute.snapshot.params.id ? this._roomRoute.snapshot.params.id : null;
  }

  public get room(): KalturaRoomEntry {
    return this._room.getValue().room;
  }

  public get roomId(): string {
    return this._roomId;
  }

  public get roomIsDirty(): boolean {
    return this._roomIsDirty;
  }

  constructor(private _router: Router,
              private _roomRoute: ActivatedRoute,
              private _appAuth: AppAuthentication,
              private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _roomsStore: RoomsStore,
              private _contentRoomView: ContentRoomViewService,
              private _contentRoomsMainView: ContentRoomsMainViewService,
              private _pageExitVerificationService: PageExitVerificationService,
              @Host() private _widgetsManager: RoomWidgetsManager) {
    this._widgetsManager.roomStore = this;
    this._mapSections();
    this._onSectionsStateChanges();
    this._onRouterEvents();
  }

  ngOnDestroy() {
    this._room.complete();
    this._state.complete();

    if (this._pageExitVerificationToken) {
      this._pageExitVerificationService.remove(this._pageExitVerificationToken);
    }

    if (this._loadRoomSubscription) {
      this._loadRoomSubscription.unsubscribe();
    }

    if (this._saveRoomInvoked) {
      this._roomsStore.reload();
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

          if (newDirtyState && this._roomIsDirty !== newDirtyState) {
            this._roomIsDirty = newDirtyState;

            this._updatePageExitVerification();
          }
        }
      );
  }

  private _updatePageExitVerification(): void {
    if (this._roomIsDirty) {
      this._pageExitVerificationToken = this._pageExitVerificationService.add();
    } else {
      if (this._pageExitVerificationToken) {
        this._pageExitVerificationService.remove(this._pageExitVerificationToken);
      }
      this._pageExitVerificationToken = null;
    }
  }

  private _loadRoom(id: string): void {
    if (this._loadRoomSubscription) {
      this._loadRoomSubscription.unsubscribe();
      this._loadRoomSubscription = null;
    }

    this._roomId = id;
    this._roomIsDirty = false;
    this._updatePageExitVerification();

    this._state.next({ action: ActionTypes.RoomLoading });
    this._widgetsManager.notifyDataLoading(id);

    if (!id) {
      return this._state.next({ action: ActionTypes.RoomLoadingFailed, error: new Error('Missing roomId') });
    }

    this._loadRoomSubscription = this._kalturaServerClient
      .request(new RoomGetAction({ roomId: id }))
      .pipe(cancelOnDestroy(this))
      .subscribe(room => {
              this._room.next({ room });
              this._notifications.next({ type: NotificationTypes.ViewEntered });

              if (this._contentRoomView.isAvailable({
              room,
              activatedRoute: this._roomRoute,
              section: ContentRoomViewSections.ResolveFromActivatedRoute
          })) {

              this._loadRoomSubscription = null;

              const playlistLoadedResult = this._widgetsManager.notifyDataLoaded(room, { isNewData: false });
              if (playlistLoadedResult.errors.length) {
                  this._state.next({
                      action: ActionTypes.RoomLoadingFailed,
                      error: new Error('one of the widgets failed while handling data loaded event')
                  });
              } else {
                  this._state.next({ action: ActionTypes.RoomLoaded });
              }
          }
        },
        error => {
          this._loadRoomSubscription = null;
          this._state.next({ action: ActionTypes.RoomLoadingFailed, error });
        }
      );
  }

  private _mapSections(): void {
    if (!this._roomRoute || !this._roomRoute.snapshot.data.roomRoute) {
      throw new Error('this service can be injected from component that is associated to the room route');
    }

    this._roomRoute.snapshot.routeConfig.children.forEach(childRoute => {
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
          const currentRoomId = this._roomRoute.snapshot.params.id;
          this._notifications.next({ type: NotificationTypes.ViewEntered });
        }
      );
  }

  public saveRoom(): void {
    if (this.room && this.room instanceof KalturaRoomEntry) {
      const newRoom = <KalturaRoomEntry>KalturaObjectBaseFactory.createObject(this.room);

      const id = this._getRoomId();
      const action = new RoomUpdateAction({roomId: id, room: newRoom});
      const request = new KalturaMultiRequest(action);

      this._widgetsManager.notifyDataSaving(newRoom, request, this.room)
        .pipe(cancelOnDestroy(this))
        .pipe(tag('block-shell'))
        .pipe(switchMap((response: { ready: boolean, reason?: OnDataSavingReasons, errors?: Error[] }) => {
            if (response.ready) {
              this._saveRoomInvoked = true;

              return this._kalturaServerClient.multiRequest(request)
                .pipe(tag('block-shell'))
                .pipe(map(([res]) => {
                    if (res.error) {
                      this._state.next({ action: ActionTypes.RoomSavingFailed });
                    } else {
                      if (id === 'new') {
                        this._roomIsDirty = false;
                          this._contentRoomView.open({ room: res.result, section: ContentRoomViewSections.Metadata });
                      } else {
                        this._loadRoom(this.roomId);
                      }
                    }

                    return EMPTY;
                  }
                ))
            } else {
              switch (response.reason) {
                case OnDataSavingReasons.validationErrors:
                  this._state.next({ action: ActionTypes.RoomDataIsInvalid });
                  break;
                case OnDataSavingReasons.attachedWidgetBusy:
                  this._state.next({ action: ActionTypes.ActiveSectionBusy });
                  break;
                case OnDataSavingReasons.buildRequestFailure:
                  this._state.next({ action: ActionTypes.RoomPrepareSavingFailed });
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
            this._state.next({ action: ActionTypes.RoomSavingFailed, error });
          }
        );
    } else {
      console.error(new Error(`Failed to create a new instance of the room type '${this.room ? typeof this.room : 'n/a'}`));
      this._state.next({ action: ActionTypes.RoomPrepareSavingFailed });
    }
  }

  public reloadRoom(): void {
    if (this._getRoomId()) {
      this._loadRoom(this.roomId);
    }
  }

  public openSection(sectionKey: ContentRoomViewSections): void {
     this._contentRoomView.open({ section: sectionKey, room: this.room });
  }

  public openRoom(room: KalturaRoomEntry) {
    if (this.roomId !== room.id) {
      this.canLeaveWithoutSaving()
            .pipe(
                filter(({ allowed }) => allowed),
                cancelOnDestroy(this)
            )
            .subscribe(() => {
                this._contentRoomView.open({ room, section: ContentRoomViewSections.Metadata });
            });
    }
  }

  public canLeaveWithoutSaving(): Observable<{ allowed: boolean }> {
    return Observable.create(observer => {
      if (this._roomIsDirty) {
        this._browserService.confirm(
          {
            header: 'Cancel Edit',
            message: 'Discard all changes?',
            accept: () => {
              this._roomIsDirty = false;
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

  public returnToRooms(): void {
    this.canLeaveWithoutSaving()
      .pipe(cancelOnDestroy(this))
      .pipe(filter(({ allowed }) => allowed))
      .subscribe(() => {
          this._contentRoomsMainView.open();
      });
  }
}
