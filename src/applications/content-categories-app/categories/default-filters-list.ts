import {KalturaPrivacyType} from 'kaltura-ngx-client';
import {KalturaAppearInListType} from 'kaltura-ngx-client';
import {KalturaContributionPolicyType} from 'kaltura-ngx-client';

export interface DefaultFilterList {
  label: string;
  name: string;
  items: { value: string, label: string }[]
}

export const EntitlementsFiltersList: DefaultFilterList[] = [
  {
    name: 'privacyTypes', label: 'All Content Privacy Options',
    items: [
      {value: KalturaPrivacyType.all.toString(), label: 'No Restriction'},
      {value: KalturaPrivacyType.authenticatedUsers.toString(), label: 'Requires Authentication'},
      {value: KalturaPrivacyType.membersOnly.toString(), label: 'Private'}
    ]
  },
  {
    name: 'categoryListing', label: 'All Category Listing Options',
    items: [
      {value: KalturaAppearInListType.partnerOnly.toString(), label: 'No Restriction'},
      {value: KalturaAppearInListType.categoryMembersOnly.toString(), label: 'Private'}
    ]
  },
  {
    name: 'contributionPolicy', label: 'All Contribution Policy Options',
    items: [
      {value: KalturaContributionPolicyType.all.toString(), label: 'No Restriction'},
      {value: KalturaContributionPolicyType.membersWithContributionPermission.toString(), label: 'Private'}
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
