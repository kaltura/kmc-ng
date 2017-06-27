import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { PlaylistGetAction } from 'kaltura-typescript-client/types/PlaylistGetAction';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PlaylistSections } from './playlist-sections';

@Injectable()
export class PlaylistStore implements OnDestroy {
	public _sectionsState = new BehaviorSubject<{ metadataIsValid: boolean, contentIsValid: boolean }>({
		metadataIsValid: true,
		contentIsValid: true
	});
	private _loadPlaylistSubscription : ISubscription;
  private _sectionToRouteMapping : { [key : number] : string} = {};
	public _activeSection = new BehaviorSubject<{ section: PlaylistSections}>({section: null});
	private _playlist = new BehaviorSubject<{ playlist: KalturaPlaylist}>({playlist: null});
	private _state = new BehaviorSubject<{ isBusy: boolean, error?: { message: string, origin: 'reload' | 'save'}}>({isBusy: false});

	public playlist$ = this._playlist.asObservable();
  public activeSection$ = this._activeSection.asObservable();
	public sectionsState$ = this._sectionsState.asObservable();
	public state$ = this._state.asObservable();
	private _playlistId: string;

	public openSection(sectionId: PlaylistSections): void {
    const navigatePath = this._sectionToRouteMapping[sectionId];

    if (navigatePath) {
      this._router.navigate([navigatePath], {relativeTo: this._playlistRoute});
    }
		this._activeSection.next({section: sectionId});
	}

	constructor(
		private _router: Router,
		private _playlistRoute: ActivatedRoute,
		private _kalturaServerClient: KalturaClient,
		private _appLocalization: AppLocalization
	) {
		this._state.next({isBusy: true});
		this._sectionsState.next({metadataIsValid: true, contentIsValid: true});

		this._mapSections();

		this._onRouterEvents();

    this._activeSection.next({section: this._playlistRoute.snapshot.firstChild.data.sectionKey});
	}

  private _mapSections() : void {
    if (!this._playlistRoute || !this._playlistRoute.snapshot.data.entryRoute)
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
						const currentPlaylistId = this._playlistRoute.snapshot.params.id;
						const playlist = this._playlist.getValue();
						if (!playlist.playlist || (playlist.playlist && playlist.playlist.id !== currentPlaylistId)) {
							this._loadPlaylist(currentPlaylistId);
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

		this._playlistId = id;
		this._state.next({isBusy: true});

		this._loadPlaylistSubscription = this._kalturaServerClient.request(new PlaylistGetAction({id}))
			.cancelOnDestroy(this)
			.subscribe(
				response => {
					if (response instanceof KalturaPlaylist) {
						this._playlist.next({playlist: response});
						this._playlistId = response.id;
						this._state.next({isBusy: false});
					} else {
						this._state.next({
							isBusy: true,
							error: {
								message: this._appLocalization.get('applications.content.playlistDetails.errors.entryTypeNotSupported'),
								origin: 'reload'
							}
						});
					}
				},
				error => {
					this._state.next({
						isBusy: true,
						error: {message: error.message, origin: 'reload'}
					});
				}
			);
	}

  public reloadPlaylist() : void
  {
    if (this._playlistId)
    {
      this._loadPlaylist(this._playlistId);
    }
  }

	ngOnDestroy() {
		this._loadPlaylistSubscription && this._loadPlaylistSubscription.unsubscribe();
		this._state.complete();
		this._playlist.complete();
	}
}
