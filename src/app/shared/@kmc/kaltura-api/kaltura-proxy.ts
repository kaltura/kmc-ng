import { Injectable,ReflectiveInjector } from '@angular/core';
import { Http } from '@angular/http';
import { UserService } from './user-service';
import {KMCConfig} from "../core/kmc-config.service";


@Injectable()
export class KalturaProxy {

    public user: UserService;
    constructor(http : Http, kmcConfig : KMCConfig){
        const injector =  ReflectiveInjector.resolveAndCreate([UserService,
            { provide : KMCConfig, useValue : kmcConfig},
            {provide : Http, useValue : http}
        ]);

        this.user = injector.get(UserService);
    }

}