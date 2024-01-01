import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { DocumentComponent } from './document.component';
import { Observable } from 'rxjs';

@Injectable()
export class DocumentCanDeactivate implements CanDeactivate<DocumentComponent> {
    constructor() {}
    canDeactivate(component: DocumentComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot):Observable<boolean> {
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
