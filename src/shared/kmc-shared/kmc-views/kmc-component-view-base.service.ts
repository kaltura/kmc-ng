import { Observable } from 'rxjs/Observable';

export abstract class KmcComponentViewBaseService<TArgs extends {}> {

    constructor() {
    }

    abstract isAvailable(args: TArgs): boolean;
}
