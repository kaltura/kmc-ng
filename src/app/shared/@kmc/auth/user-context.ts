
import { IReadonlyUserContext } from './i-readonly-user-context';

export class UserContext implements IReadonlyUserContext{

    ks : string;
    firstname : string;
    id : string;
    partnerId: string;
    fullName: string;
    firstName: string;
    lastName: string;
    roleIds: string;
    roleNames: string;
    isAccountOwner : string;
    permissions : any;

    constructor()
    {
    }


    public getKS() : string {
        return this.ks;
    }
}

