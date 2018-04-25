import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class KmcAuthenticationInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request)
            .do(
                (event: HttpEvent<any>) => {
                  console.warn('KmcAuthenticationInterceptor:+', event);
                },
                (err: any) => {
                   console.warn('KmcAuthenticationInterceptor:-', err);
                });
    }
}
