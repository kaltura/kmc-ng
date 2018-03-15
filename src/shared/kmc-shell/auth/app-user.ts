
export interface PartnerInfo {
    partnerId: number;
    name: string;
    partnerPackage: PartnerPackageTypes;
    landingPage: string;
    adultContent: boolean;
}

export enum PartnerPackageTypes {
    PartnerPackageFree = 1,
    PartnerPackagePaid = 2,
    PartnerPackageDeveloper = 100
}


export interface AppUser {
    ks: string;
    id: string;
    partnerId: number;
    permissions: string[];
    fullName: string;
    firstName: string;
    lastName: string;
    partnerInfo: PartnerInfo;
    createdAt: Date;
}

