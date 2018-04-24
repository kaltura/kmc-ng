import { Observable } from 'rxjs/Observable';

export abstract class KmcMainViewBaseService {

    constructor() {
    }

    protected abstract _open(): Observable<boolean>;

    abstract isAvailable(): boolean;
    open(): void {
        this._open().subscribe(); // TODO sakal handle
    }
}
