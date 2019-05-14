
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';

export interface PartnerInfo {
    partnerId: number;
    name: string;
    partnerPackage: PartnerPackageTypes;
    landingPage: string;
    adultContent: boolean;
    publisherEnvironmentType: number;
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
    fullName: string;
    firstName: string;
    lastName: string;
    partnerInfo: PartnerInfo;
    createdAt: Date;
    publishersQuota: number;
}

