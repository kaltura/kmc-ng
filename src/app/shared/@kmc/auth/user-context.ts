
export class UserContext {

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
    accountName: string;

    constructor()
    {
    }


    get KS() : string {
        return this.ks;
    }
}

