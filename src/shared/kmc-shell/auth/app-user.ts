import { PartnerInfo } from "./partner-info";
export class AppUser {

    ks : string;
    firstname : string;
    id : string;
    partnerId: number;
    fullName: string;
    firstName: string;
    lastName: string;
    roleIds: string;
    roleNames: string;
    isAccountOwner : string;
    permissions : any;
    permissionsFlags : string[];
    partnerInfo: PartnerInfo;

    constructor()
    {
    }


    get KS() : string {
        return this.ks;
    }
}

