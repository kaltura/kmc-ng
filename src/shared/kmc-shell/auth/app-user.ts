import { KalturaPartnerAuthenticationType } from "kaltura-ngx-client";
import {KalturaPartnerStatus} from "kaltura-ngx-client/lib/api/types/KalturaPartnerStatus";

export interface PartnerInfo {
    partnerId: number;
    name: string;
    status: KalturaPartnerStatus,
    adminSecret: string;
    partnerPackage: PartnerPackageTypes;
    landingPage: string;
    adultContent: boolean;
    blockDirectLogin: boolean;
    publisherEnvironmentType: number;
    authenticationType: KalturaPartnerAuthenticationType;
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

export enum AppUserStatus {
    FreeTrialActive = 1,
    FreeTrialBlocked = 2,
    PaidActive= 3,
    PaidBlocked = 4
}

