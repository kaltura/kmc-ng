import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { RoomComponent } from './room.component';
import { Observable } from 'rxjs';

@Injectable()
export class RoomCanDeactivate implements CanDeactivate<RoomComponent> {
    constructor() {}
    canDeactivate(component: RoomComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot):Observable<boolean> {
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
