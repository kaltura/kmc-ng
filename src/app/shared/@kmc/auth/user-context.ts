
import { IReadonlyUserContext } from './i-readonly-user-context';

export class UserContext implements IReadonlyUserContext{

    public ks : string;

    constructor()
    {
    }


    public getKS() : string {
        return this.ks;
    }
}

