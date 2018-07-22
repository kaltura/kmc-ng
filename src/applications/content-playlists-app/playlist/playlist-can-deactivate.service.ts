import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { PlaylistComponent } from './playlist.component';
import { Observable } from 'rxjs';

@Injectable()
export class PlaylistCanDeactivate implements CanDeactivate<PlaylistComponent> {
    constructor() {}
    canDeactivate(component: PlaylistComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot):Observable<boolean> {
        return Observable.create((observer : any) =>
        {
            component.canLeave().subscribe(
                result => {
                    observer.next(result.allowed);
                    observer.complete();
                },
                error => {
                    observer.next(false);
                    observer.complete();
                }
            );
        });
    }
}
