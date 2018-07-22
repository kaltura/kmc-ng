import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { CategoryComponent } from './category.component';
import { Observable } from 'rxjs';

@Injectable()
export class CategoryCanDeactivate implements CanDeactivate<CategoryComponent> {
    constructor() {}
    canDeactivate(component: CategoryComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot):Observable<boolean> {
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
