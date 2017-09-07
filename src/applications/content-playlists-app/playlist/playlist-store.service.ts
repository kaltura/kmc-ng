import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { PlaylistGetAction } from 'kaltura-typescript-client/types/PlaylistGetAction';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PlaylistUpdateAction} from 'kaltura-typescript-client/types/PlaylistUpdateAction';
import { Observable } from 'rxjs/Observable';
import { BrowserService } from "app-shared/kmc-shell";
import { TagSearchAction } from 'kaltura-typescript-client/types/TagSearchAction';
import { KalturaTagFilter } from 'kaltura-typescript-client/types/KalturaTagFilter';
import { KalturaTaggedObjectType } from 'kaltura-typescript-client/types/KalturaTaggedObjectType';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { PlaylistSections } from './playlist-sections';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { PlaylistExecuteAction } from 'kaltura-typescript-client/types/PlaylistExecuteAction';
import { KalturaBaseEntry } from 'kaltura-typescript-client/types/KalturaBaseEntry';
import { PlaylistsStore } from 'applications/content-playlists-app/playlists/playlists-store/playlists-store.service';
import { KalturaPlaylistType } from 'kaltura-typescript-client/types/KalturaPlaylistType';
import { PlaylistAddAction } from 'kaltura-typescript-client/types/PlaylistAddAction';

@Injectable()
export class PlaylistStore implements OnDestroy {
  private _sectionsState = new BehaviorSubject<{
    metadata: {isValid: boolean, isDirty?: boolean},
    content:  {isValid: boolean, isDirty?: boolean}
  }>({
    metadata: {isValid: true, isDirty: false},
    content: {isValid: true, isDirty: false}
  });
  private _loadPlaylistSubscription : ISubscription;
  private _sectionToRouteMapping : { [key : number] : string} = {};
  private _activeSection = new BehaviorSubject<{ section: PlaylistSections}>({section: null});
  private _playlist = new BehaviorSubject<{ playlist: KalturaPlaylist}>({playlist: null});
  private _state = new BehaviorSubject<{ isBusy: boolean, error?: { message: string, origin?: 'reload' | 'save' | 'pre-save'}}>({isBusy: false});
  private _entries  = new BehaviorSubject({items: [], totalCount: 0});

  public entries$ = this._entries.asObservable();
  public playlist$ = this._playlist.asObservable();
  public activeSection$ = this._activeSection.asObservable();
  public sectionsState$ = this._sectionsState.asObservable();
  public state$ = this._state.asObservable();
  private _savePlaylistInvoked = false;

  private _getPlaylistId() : string
  {
    return this._playlist.getValue().playlist ? this._playlist.getValue().playlist.id : null;
  }

  public get playlist() : KalturaPlaylist{
    return this._playlist.getValue().playlist;
  }

  constructor(
    private _router: Router,
    private _playlistRoute: ActivatedRoute,
    private _kalturaServerClient: KalturaClient,
    private _appLocalization: AppLocalization,
    private _browserService : BrowserService,
    private _playlistsStore: PlaylistsStore

  ) {
    this._mapSections();

    this._onRouterEvents();

    this._activeSection.next({section: this._playlistRoute.snapshot.firstChild.data.sectionKey});
  }

  public openSection(sectionId: PlaylistSections): void {
    const navigatePath = this._sectionToRouteMapping[sectionId];

    if (navigatePath) {
      this._router.navigate([navigatePath], {relativeTo: this._playlistRoute});
    }
  }

  private _mapSections() : void {
    if (!this._playlistRoute || !this._playlistRoute.snapshot.data.playlistRoute)
    {
      throw new Error("this service can be injected from component that is associated to the playlist route");
    }
    this._playlistRoute.snapshot.routeConfig.children.forEach(childRoute =>
    {
      const routeSectionType = childRoute.data ? childRoute.data.sectionKey : null;

      if (routeSectionType !== null)
      {
        this._sectionToRouteMapping[routeSectionType] = childRoute.path;
      }
    });
  }

  private _onRouterEvents() : void {
    this._router.events
      .cancelOnDestroy(this)
      .subscribe(
        event => {
          if (event instanceof NavigationEnd) {
            const currentPlaylist = this._playlist.getValue();
            const requestedPlaylistId = this._playlistRoute.snapshot.params.id;
            const requestedSectionKey = this._playlistRoute.snapshot.firstChild.data.sectionKey;

            if (requestedPlaylistId === 'new') {

              const shouldCreatePlaylist = !currentPlaylist || !currentPlaylist.playlist;

              if (shouldCreatePlaylist) {
                const newData = this._playlistsStore.getNewPlaylistData();

                if (newData) {
                  this._playlistsStore.clearNewPlaylistData();
                  this._playlist.next({
                    playlist: new KalturaPlaylist({
                      name: newData.name,
                      description: newData.description,
                      playlistType: KalturaPlaylistType.staticList
                    })
                  });
                } else {
                  this._router.navigate(['content/playlists']);
                }
              }else {
                this._activeSection.next({section: requestedSectionKey});
              }
            } else {

              const shouldLoadPlaylist = !currentPlaylist || !currentPlaylist.playlist || currentPlaylist.playlist.id !== requestedPlaylistId;
              if (shouldLoadPlaylist) {
                this._loadPlaylist(requestedPlaylistId);
              } else {
                this._activeSection.next({section: requestedSectionKey});
              }
            }
          }
        }
      )
  }

  private _loadPlaylist(id : string) : void  {
    if (this._loadPlaylistSubscription) {
      this._loadPlaylistSubscription.unsubscribe();
      this._loadPlaylistSubscription = null;
    }

    this._state.next({isBusy: true});

    this._loadPlaylistSubscription = this._kalturaServerClient.multiRequest(
      new KalturaMultiRequest(
        new PlaylistGetAction({id}),
        new PlaylistExecuteAction({id})
      ))
      .cancelOnDestroy(this)
      .subscribe(
        data => {
          data.forEach(response => {
            if (response.result instanceof KalturaPlaylist) {
              this._playlist.next({playlist: response.result});
              this._state.next({isBusy: false});
            } else if(response.result.length >= 1 && response.result[0] instanceof KalturaBaseEntry) {
              this._entries.next({
                items: <any[]>response.result,
                totalCount: <number>response.result.length
              });
            } else {
              this._state.next({
                isBusy: true,
                error: {
                  message: this._appLocalization.get('applications.content.playlistDetails.errors.playlistTypeNotSupported'),
                  origin: 'reload'
                }
              });
            }
          });
        },
        error => {
          this._state.next({
            isBusy: true,
            error: {message: error.message, origin: 'reload'}
          });
        }
      );

  }

  public updateSectionState(section: PlaylistSections, state : {isValid?: boolean, isDirty?: boolean}) : void {
    const sections = Object.assign({}, this._sectionsState.getValue());
    let hasChanges = false;

    switch (section) {
      case PlaylistSections.Metadata:
        if (typeof state.isValid !== 'undefined' && state.isValid !== null && sections.metadata.isValid !== state.isValid) {
          sections.metadata.isValid = state.isValid;
          hasChanges = true;
        }

        if (typeof state.isDirty !== 'undefined' && state.isDirty !== null && sections.metadata.isDirty !== state.isDirty) {
          sections.metadata.isDirty = state.isDirty;
          hasChanges = true;
        }
        break;
      case PlaylistSections.Content:
        if (typeof state.isValid !== 'undefined' && state.isValid !== null && sections.content.isValid !== state.isValid) {
          sections.content.isValid = state.isValid;
          hasChanges = true;
        }

        if (typeof state.isDirty !== 'undefined' && state.isDirty !== null && sections.content.isDirty !== state.isDirty) {
          sections.content.isDirty = state.isDirty;
          hasChanges = true;
        }
        break;
    }

    if(hasChanges) {
      this._sectionsState.next(sections);
      this._updatePageExitVerification(sections.metadata.isDirty || sections.content.isDirty);
    }
  }

  public savePlaylist() : void {
    if(!this._sectionsState.getValue().metadata.isValid) {
      this._state.next({
        isBusy: false,
        error: {message: this._appLocalization.get('applications.content.playlistDetails.errors.validationError'), origin: 'save'}
      });
    } else {
      let id: string = this._getPlaylistId(),
        playlist: KalturaPlaylist = new KalturaPlaylist({
          name: this._playlist.getValue().playlist.name,
          description: this._playlist.getValue().playlist.description,
          tags: this._playlist.getValue().playlist.tags
        });
      if(this._entries.getValue().totalCount >= 1) {
        this._state.next({isBusy: true});
        if(id) {
          this._kalturaServerClient.request(
            new PlaylistUpdateAction({id, playlist})
          )
            .cancelOnDestroy(this)
            .subscribe(
              () => {
                this._savePlaylistInvoked = true;
                this._loadPlaylist(id);
              },
              error => {
                this._state.next({
                  isBusy: true,
                  error: {message: error.message, origin: 'reload'}
                });
              }
            )
        } else {
          playlist = this._playlist.getValue().playlist;
          this._kalturaServerClient.request(
            new PlaylistAddAction({playlist})
          )
            .cancelOnDestroy(this)
            .subscribe(
              response => {
                this._state.next({isBusy: false});
                this._savePlaylistInvoked = true;
                this.openPlaylist(response.id);
              },
              error => {
                this._state.next({
                  isBusy: true,
                  error: {message: error.message, origin: 'pre-save'}
                });
              }
            )
        }
      } else {
        this._state.next({
          isBusy: false,
          error: {message: 'Add at least one media', origin: 'save'}
        });
      }
    }
  }

  public reloadPlaylist() : void
  {
    if (this._getPlaylistId()) {
      this._loadPlaylist(this._getPlaylistId());
    }
  }

  public openPlaylist(playlistId : string)
  {
    this.canLeaveWithoutSaving()
      .cancelOnDestroy(this)
      .subscribe(
        response =>
        {
          if (response.allowed)
          {
            this._router.navigate(["playlist", playlistId],{ relativeTo : this._playlistRoute.parent});
          }
        }
      );
  }

  public returnToPlaylists() {
    this.canLeaveWithoutSaving()
      .cancelOnDestroy(this)
      .monitor('playlist store: return to playlists list')
      .subscribe(
        response =>
        {
          if (response.allowed)
          {
            this._router.navigate(['content/playlists']);
          }
        }
      );
  }

  private _updatePageExitVerification(enable : boolean) : void {
    if (enable) {
      this._browserService.enablePageExitVerification();
    }
    else {
      this._browserService.disablePageExitVerification();
    }
  }

  public canLeaveWithoutSaving() : Observable<{ allowed : boolean}> {
    return Observable.create(observer =>
    {
      if (this._sectionsState.getValue().metadata.isDirty || this._sectionsState.getValue().content.isDirty) {
        this._browserService.confirm(
          {
            header: 'Cancel Edit',
            message: 'Discard all changes?',
            accept: () => {
              observer.next({allowed: true});
              observer.complete();
            },
            reject: () => {
              observer.next({allowed: false});
              observer.complete();
            }
          }
        )
      } else {
        observer.next({allowed: true});
        observer.complete();
      }
    }).monitor('playlist store: check if can leave section without saving');
  }

  public searchTags(text : string): Observable<string[]> {
    return Observable.create(
      observer => {
        const requestSubscription = this._kalturaServerClient.request(
          new TagSearchAction(
            {
              tagFilter: new KalturaTagFilter(
                {
                  tagStartsWith : text,
                  objectTypeEqual : KalturaTaggedObjectType.entry
                }
              ),
              pager: new KalturaFilterPager({
                pageIndex : 0,
                pageSize : 30
              })
            }
          )
        )
          .cancelOnDestroy(this)
          .monitor('search tags')
          .subscribe(
            result =>
            {
              const tags = result.objects.map(item => item.tag);
              observer.next(tags);
              observer.complete();
            },
            err =>
            {
              observer.error(err);
            }
          );

        return () =>
        {
          console.log("entryMetadataHandler.searchTags(): cancelled");
          requestSubscription.unsubscribe();
        }
      });
  }

  ngOnDestroy() {
    this._loadPlaylistSubscription && this._loadPlaylistSubscription.unsubscribe();
    this._state.complete();
    this._playlist.complete();

    if (this._savePlaylistInvoked)
    {
      this._playlistsStore.reload(true);
    }
  }
}

