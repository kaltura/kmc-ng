import {KalturaPrivacyType} from 'kaltura-ngx-client/api/types/KalturaPrivacyType';
import {KalturaAppearInListType} from 'kaltura-ngx-client/api/types/KalturaAppearInListType';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client/api/types/KalturaContributionPolicyType';

export interface DefaultFilterList {
  label: string;
  name: string;
  items: { value: string, label: string }[]
}

export const DefaultFiltersList: DefaultFilterList[] = [
  {
    name: 'privacyTypes', label: 'All Content Privacy Options',
    items: [
      {value: String(KalturaPrivacyType.all), label: 'No Restriction'},
      {value: String(KalturaPrivacyType.authenticatedUsers), label: 'Requires Authentication'},
      {value: String(KalturaPrivacyType.membersOnly), label: 'Private'}
    ]
  },
  {
    name: 'categoryListing', label: 'All Category Listing Options',
    items: [
      {value: String(KalturaAppearInListType.partnerOnly), label: 'No Restriction'},
      {value: String(KalturaAppearInListType.categoryMembersOnly), label: 'Private'}
    ]
  },
  {
    name: 'contributionPolicy', label: 'All Contribution Policy Options',
    items: [
      {value: String(KalturaContributionPolicyType.all), label: 'No Restriction'},
      {value: String(KalturaContributionPolicyType.membersWithContributionPermission), label: 'Private'}
    ]
  },
  {
    name: 'endUserPermissions', label: 'Specific End-User Permissions',
    items: [
      {value: 'has', label: 'Has Specific End-User Permissions'},
      {value: 'no', label: 'No Specific End-User Permissions'}
    ]
  }
];
