import {KalturaPrivacyType} from 'kaltura-ngx-client/api/types/KalturaPrivacyType';
import {KalturaAppearInListType} from 'kaltura-ngx-client/api/types/KalturaAppearInListType';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client/api/types/KalturaContributionPolicyType';

export interface DefaultFilterList {
  label: string;
  name: string;
  items: { value: KalturaPrivacyType, label: string }[]
}

export const DefaultFiltersList: DefaultFilterList[] = [
  {
    name: 'privacyTypes', label: 'All Content Privacy Options',
    items: [
      {value: KalturaPrivacyType.all, label: 'No Restriction'},
      {value: KalturaPrivacyType.authenticatedUsers, label: 'Requires Authentication'},
      {value: KalturaPrivacyType.membersOnly, label: 'Private'}
    ]
  },
  {
    name: 'categoryListing', label: 'All Category Listing Options',
    items: [
      {value: KalturaAppearInListType.partnerOnly, label: 'No Restriction'},
      {value: KalturaAppearInListType.categoryMembersOnly, label: 'Private'}
    ]
  },
  {
    name: 'contributionPolicy', label: 'All Contribution Policy Options',
    items: [
      {value: KalturaContributionPolicyType.all, label: 'No Restriction'},
      {value: KalturaContributionPolicyType.membersWithContributionPermission, label: 'Private'}
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
