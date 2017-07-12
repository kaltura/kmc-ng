export class PartnerInfo {

	name: string;
	partnerPackage: number;
	landingPage: string;

	constructor(name: string, partnerPackage: number, landingPage: string)
	{
		this.name = name;
		this.partnerPackage = partnerPackage;
		this.landingPage = landingPage;
	}
}

export enum PartnerPackageTypes {
	PartnerPackageFree = 1,
	PartnerPackagePaid = 2,
	PartnerPackageDeveloper = 100
}
