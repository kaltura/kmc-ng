import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from "@angular/router";

@Injectable()
export class PlaylistStore implements OnDestroy {

    constructor( private _router: Router ) {}

	private _canLeaveWithoutSaving() : Observable<{ allowed : boolean}>
	{
		return Observable.create(observer =>
		{
			observer.next({allowed: true});
			observer.complete();
		}).monitor('playlist store: check if can leave section without saving');
	}

	ngOnDestroy() {

	}

	public returnToPlaylists(params : {force? : boolean} = {})
	{
		this._canLeaveWithoutSaving()
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
}
