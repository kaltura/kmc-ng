import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs'
import {KalturaAPIClient} from "./kaltura-api-client";



export  class KalturaRequest<T> {

    public ksValueGenerator = false;

    constructor(public service : string, public action : string, public parameters : Object, options? : { ksValueGenerator? : boolean} ) {
        if (options && typeof options.ksValueGenerator === 'boolean')
        {
            this.ksValueGenerator = options.ksValueGenerator;
        }
    }

    execute(client : KalturaAPIClient) : Observable<T>{
        const ksValue = { assignAutomatically : !this.ksValueGenerator };
        const requestParameters = Object.assign({
            service : this.service,
            action : this.action
        },this.parameters);

        return client.transmit({ parameters : requestParameters, ksValue});
    }
}