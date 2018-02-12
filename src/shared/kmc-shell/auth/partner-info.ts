export class PartnerInfo {

	name: string;
	partnerPackage: number;
	landingPage: string;
	adultContent: boolean;

	constructor(name: string, partnerPackage: number, landingPage: string, adultContent: boolean)
	{
		this.name = name;
		this.partnerPackage = partnerPackage;
		this.landingPage = landingPage;
		this.adultContent = adultContent;
	}
}

export enum PartnerPackageTypes {
	PartnerPackageFree = 1,
	PartnerPackagePaid = 2,
	PartnerPackageDeveloper = 100
}
