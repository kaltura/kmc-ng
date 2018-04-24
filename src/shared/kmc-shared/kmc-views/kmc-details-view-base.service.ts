import { Observable } from 'rxjs/Observable';

export abstract class KmcDetailsViewBaseService<TArgs extends {}> {

    constructor() {
    }

    protected abstract _open(args: TArgs): Observable<boolean>;

    abstract isAvailable(args: TArgs): boolean;

    open(args: TArgs): void {
        this._open(args).subscribe(); // TODO sakal handle
    }
}
