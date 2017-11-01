import { Host, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { PlaylistGetAction } from 'kaltura-typescript-client/types/PlaylistGetAction';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PlaylistUpdateAction } from 'kaltura-typescript-client/types/PlaylistUpdateAction';
import { Observable } from 'rxjs/Observable';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaMultiRequest, KalturaMultiResponse, KalturaTypesFactory } from 'kaltura-typescript-client';
import { PlaylistExecuteAction } from 'kaltura-typescript-client/types/PlaylistExecuteAction';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { PlaylistsStore } from '../playlists/playlists-store/playlists-store.service';
import { KalturaPlaylistType } from 'kaltura-typescript-client/types/KalturaPlaylistType';
import { PlaylistAddAction } from 'kaltura-typescript-client/types/PlaylistAddAction';
import { PlaylistWidgetsManager } from './playlist-widgets-manager';
import { OnDataSavingReasons } from '@kaltura-ng/kaltura-ui';

export enum ActionTypes {
  PlaylistLoading,
  PlaylistLoaded,
  PlaylistLoadingFailed,
  PlaylistSaving,
  PlaylistPrepareSavingFailed,
  PlaylistSavingFailed,
  PlaylistDataIsInvalid,
  ActiveSectionBusy
}

export interface StatusArgs {
  action: ActionTypes;
  error?: Error;
}

@Injectable()
export class PlaylistStore implements OnDestroy {
  private _loadPlaylistSubscription: ISubscription;
  private _sectionToRouteMapping: { [key: number]: string } = {};
  private _state = new BehaviorSubject<StatusArgs>({ action: ActionTypes.PlaylistLoading, error: null });
  private _playlistIsDirty = false;
  private _savePlaylistInvoked = false;
  private _playlistId: string;
  private _playlist = new BehaviorSubject<{ playlist: KalturaPlaylist, entries: KalturaMediaEntry[], entriesTotalCount: number }>({
    playlist: null,
    entries: [],
    entriesTotalCount: 0
  });

  public playlist$ = this._playlist.asObservable();
  public state$ = this._state.asObservable();

  private _getPlaylistId(): string {
    return this._playlistRoute.snapshot.params.id ? this._playlistRoute.snapshot.params.id : null;
  }

  public get playlist(): KalturaPlaylist {
    return this._playlist.getValue().playlist;
  }

  public get playlistId(): string {
    return this._playlistId;
  }

  public get entries(): KalturaMediaEntry[] {
    return this._playlist.getValue().entries;
  }

  public get playlistIsDirty(): boolean {
    return this._playlistIsDirty;
  }

  constructor(private _router: Router,
              private _playlistRoute: ActivatedRoute,
              private _kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _playlistsStore: PlaylistsStore,
              @Host() private _sectionsManager: PlaylistWidgetsManager) {
    this._sectionsManager.playlistStore = this;
    this._mapSections();
    this._onSectionsStateChanges();
    this._onRouterEvents();
  }

  ngOnDestroy() {
    this._state.complete();
    this._playlist.complete();

    this._browserService.disablePageExitVerification();

    if (this._loadPlaylistSubscription) {
      this._loadPlaylistSubscription.unsubscribe();
    }

    if (this._savePlaylistInvoked) {
      this._playlistsStore.reload(true);
    }
  }

  private _onSectionsStateChanges(): void {
    this._sectionsManager.widgetsState$
      .cancelOnDestroy(this)
      .debounce(() => Observable.timer(500))
      .subscribe(
        sectionsState => {
          const newDirtyState = Object.keys(sectionsState)
            .reduce((result, sectionName) => result || sectionsState[sectionName].isDirty, false);

          if (this._playlistIsDirty !== newDirtyState) {
            console.log(`playlist store: update entry is dirty state to ${newDirtyState}`);
            this._playlistIsDirty = newDirtyState;

            this._updatePageExitVerification();
          }
        }
      );
  }

  private _updatePageExitVerification(): void {
    if (this._playlistIsDirty) {
      this._browserService.enablePageExitVerification();
    } else {
      this._browserService.disablePageExitVerification();
    }
  }

  private _loadPlaylist(id: string): void {
    if (this._loadPlaylistSubscription) {
      this._loadPlaylistSubscription.unsubscribe();
      this._loadPlaylistSubscription = null;
    }

    this._playlistId = id;
    this._playlistIsDirty = false;
    this._updatePageExitVerification();

    this._state.next({ action: ActionTypes.PlaylistLoading });
    this._sectionsManager.notifyDataLoading(id);

    this._loadPlaylistSubscription = this._getPlaylist(id)
      .cancelOnDestroy(this)
      .subscribe(([playlist, entries]) => {
          this._playlist.next({
            playlist: playlist.result,
            entries: this.entries,
            entriesTotalCount: this._playlist.getValue().entriesTotalCount
          });

          if (entries.result && entries.result.length) {
            this._playlist.next({
              playlist: this.playlist,
              entries: <KalturaMediaEntry[]>entries.result,
              entriesTotalCount: <number>entries.result.length
            });
          } else {
            this._playlist.next({
              playlist: this.playlist,
              entries: [],
              entriesTotalCount: 0
            });
          }
          const playlistLoadedResult = this._sectionsManager.notifyDataLoaded(playlist.result);
          if (playlistLoadedResult.errors.length) {
            this._state.next({
              action: ActionTypes.PlaylistLoadingFailed,
              error: new Error('one of the widgets failed while handling data loaded event')
            });
          } else {
            this._state.next({ action: ActionTypes.PlaylistLoaded });
          }
        },
        error => this._state.next({ action: ActionTypes.PlaylistLoadingFailed, error })
      );
  }

  private _mapSections(): void {
    if (!this._playlistRoute || !this._playlistRoute.snapshot.data.playlistRoute) {
      throw new Error('this service can be injected from component that is associated to the playlist route');
    }

    this._playlistRoute.snapshot.routeConfig.children.forEach(childRoute => {
      const routeSectionType = childRoute.data ? childRoute.data.sectionKey : null;

      if (routeSectionType !== null) {
        this._sectionToRouteMapping[routeSectionType] = childRoute.path;
      }
    });
  }

  private _onRouterEvents(): void {
    this._router.events
      .cancelOnDestroy(this)
      .filter(event => event instanceof NavigationEnd)
      .subscribe(
        () => {
          const currentPlaylistId = this._playlistRoute.snapshot.params.id;

          if (currentPlaylistId === 'new') {
            const newData = this._playlistsStore.getNewPlaylistData();

            if (newData) {
              this._playlist.next({
                playlist: new KalturaPlaylist({
                  name: newData.name,
                  description: newData.description,
                  playlistType: KalturaPlaylistType.staticList
                }),
                entries: this._playlist.getValue().entries,
                entriesTotalCount: this._playlist.getValue().entriesTotalCount
              });

              setTimeout(() => {
                const playlistLoadedResult = this._sectionsManager.notifyDataLoaded(this.playlist);
                if (playlistLoadedResult.errors.length) {
                  this._state.next({
                    action: ActionTypes.PlaylistLoadingFailed,
                    error: new Error('one of the widgets failed while handling data loaded event')
                  });
                } else {
                  this._state.next({ action: ActionTypes.PlaylistLoaded });
                }
              }, 0);
            } else {
              this._router.navigate(['content/playlists']);
            }
          } else {
            // we must defer the loadEntry to the next event cycle loop to allow components
            // to init them-selves when entering this module directly.
            setTimeout(() => {
              const playlist = this._playlist.getValue();

              if (!playlist.playlist || playlist.playlist.id !== currentPlaylistId) {
                this._loadPlaylist(currentPlaylistId);
              }
            }, 0);
          }
        }
      )
  }

  private _transmitSaveRequest(newPlaylist: KalturaPlaylist): void {
    if (this._playlist.getValue().entriesTotalCount <= 0) {
      return this._state.next({ action: ActionTypes.PlaylistSavingFailed, error: new Error('Add at least one media') });
    }

    this._state.next({ action: ActionTypes.PlaylistSaving });

    const id = this._getPlaylistId();
    const request = id
      ? new PlaylistUpdateAction({ id, playlist: newPlaylist })
      : new PlaylistAddAction({ playlist: newPlaylist });

    this._sectionsManager.notifyDataSaving(newPlaylist, request, this.playlist)
      .cancelOnDestroy(this)
      .monitor('entry store: prepare entry for save')
      .flatMap((response) => {
          if (response.ready) {
            this._savePlaylistInvoked = true;

            return this._kalturaServerClient.request(request)
              .monitor('playlist store: save playlist')
              .map(res => {
                  if ((<any>res).error) {
                    this._state.next({ action: ActionTypes.PlaylistSavingFailed });
                  } else {
                    if (!id) {
                      this._playlistsStore.clearNewPlaylistData();
                    }
                    this._loadPlaylist(this.playlistId);
                  }

                  return Observable.empty();
                }
              )
          } else {
            switch (response.reason) {
              case OnDataSavingReasons.validationErrors:
                this._state.next({ action: ActionTypes.PlaylistDataIsInvalid });
                break;
              case OnDataSavingReasons.attachedWidgetBusy:
                this._state.next({ action: ActionTypes.ActiveSectionBusy });
                break;
              case OnDataSavingReasons.buildRequestFailure:
                this._state.next({ action: ActionTypes.PlaylistPrepareSavingFailed });
                break;
            }

            return Observable.empty();
          }
        }
      )
      .subscribe(
        response => {
          // do nothing - the service state is modified inside the map functions.
        },
        error => {
          // should not reach here, this is a fallback plan.
          this._state.next({ action: ActionTypes.PlaylistSavingFailed, error });
        }
      );
  }

  private _getPlaylist(playlistId: string): Observable<KalturaMultiResponse> {
    if (!playlistId) {
      return Observable.throw(new Error('missing entryId'));
    }

    const responseProfile = new KalturaDetachedResponseProfile({
      type: KalturaResponseProfileType.includeFields,
      fields: 'thumbnailUrl,id,name,mediaType,createdAt,duration'
    });

    return this._kalturaServerClient.multiRequest(
      new KalturaMultiRequest(
        new PlaylistGetAction({ id: playlistId }),
        new PlaylistExecuteAction({
          id: playlistId,
          acceptedTypes: [KalturaMediaEntry],
          responseProfile: responseProfile
        })
      ));
  }

  public savePlaylist(): void {
    const newPlaylist = KalturaTypesFactory.createObject(this.playlist);

    if (newPlaylist && newPlaylist instanceof KalturaPlaylist) {
      this._transmitSaveRequest(newPlaylist)
    } else {
      console.error(new Error(`Failed to create a new instance of the playlist type '${this.playlist ? typeof this.playlist : 'n/a'}`));
      this._state.next({ action: ActionTypes.PlaylistPrepareSavingFailed });
    }
  }

  public reloadPlaylist(): void {
    if (this._getPlaylistId()) {
      this._loadPlaylist(this.playlistId);
    }
  }

  public openSection(sectionKey: string): void {
    const navigatePath = this._sectionToRouteMapping[sectionKey];

    if (navigatePath) {
      this._router.navigate([navigatePath], { relativeTo: this._playlistRoute });
    }
  }

  public openPlaylist(playlistId: string) {
    this.canLeaveWithoutSaving()
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if (response.allowed) {
            this._router.navigate(['playlist', playlistId], { relativeTo: this._playlistRoute.parent });
          }
        }
      );
  }

  public canLeaveWithoutSaving(): Observable<{ allowed: boolean }> {
    return Observable.create(observer => {
      if (this._playlistIsDirty) {
        this._browserService.confirm(
          {
            header: 'Cancel Edit',
            message: 'Discard all changes?',
            accept: () => {
              this._playlistIsDirty = false;
              observer.next({ allowed: true });
              observer.complete();
            },
            reject: () => {
              observer.next({ allowed: false });
              observer.complete();
            }
          }
        )
      } else {
        observer.next({ allowed: true });
        observer.complete();
      }
    }).monitor('playlist store: check if can leave section without saving');
  }

  public returnToPlaylists(): void {
    this.canLeaveWithoutSaving()
      .cancelOnDestroy(this)
      .filter(({ allowed }) => allowed)
      .monitor('playlist store: return to playlists list')
      .subscribe(() => {
        this._playlistsStore.clearNewPlaylistData();
        this._router.navigate(['content/playlists'])
      });
  }

  public deleteEntriesFromPlaylist(ids: string[]): void {
    ids.map(id => this.entries.findIndex(entry => entry.id === id))
      .forEach(index => this.deleteEntryFromPlaylist(index));
  }

  public deleteEntryFromPlaylist(rowIndex: number): void {
    this.entries.splice(rowIndex, 1);
    this._playlist.next({ playlist: this.playlist, entries: this.entries, entriesTotalCount: this.entries.length });
  }

  public moveUpEntry(rowIndex: number): void {
    const currentEntry = this.entries[rowIndex];
    this.entries.splice(rowIndex, 1);
    this.entries.splice(rowIndex - 1, 0, currentEntry);
    this._playlist.next({ playlist: this.playlist, entries: this.entries, entriesTotalCount: this.entries.length });
  }

  public moveDownEntry(rowIndex: number): void {
    const currentEntry = this.entries[rowIndex];
    this.entries.splice(rowIndex, 1);
    this.entries.splice(rowIndex + 1, 0, currentEntry);
    this._playlist.next({ playlist: this.playlist, entries: this.entries, entriesTotalCount: this.entries.length });
  }

  public duplicateEntry(rowIndex: number): void {
    this.entries.splice(rowIndex, 0, this.entries[rowIndex]);
    this._playlist.next({ playlist: this.playlist, entries: this.entries, entriesTotalCount: this.entries.length });
  }
}
