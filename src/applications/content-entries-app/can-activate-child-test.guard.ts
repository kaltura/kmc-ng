import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CanActivateChildTest implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const firstChild = route.firstChild;

    if (firstChild) {
      const [childSegment] = firstChild.url;
      console.warn(childSegment.path);
    }
    return true;
  }
}
