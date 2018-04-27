import { ModuleWithProviders, NgModule } from '@angular/core';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InvalidKsInterceptorService } from './invalid-ks-interceptor.service';

@NgModule({
    imports: <any[]>[],
    declarations: <any[]>[
    ],
    exports: <any[]>[
    ],
    providers: <any[]>[]
})
export class InvalidKsInterceptorModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: InvalidKsInterceptorModule,
            providers: <any[]>[
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: InvalidKsInterceptorService,
                    multi: true
                }
            ]
        };
    }
}
