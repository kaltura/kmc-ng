import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { CategoryData } from 'app-shared/content-shared/categories/categories-search.service';
import { KalturaPrivacyType } from 'kaltura-ngx-client/api/types/KalturaPrivacyType';
import { KalturaAppearInListType } from 'kaltura-ngx-client/api/types/KalturaAppearInListType';
import { KalturaContributionPolicyType } from 'kaltura-ngx-client/api/types/KalturaContributionPolicyType';

@Pipe({ name: 'kCategoryTooltip' })
export class CategoryTooltipPipe implements PipeTransform {
    constructor(private _appLocalization: AppLocalization) {
    }

    transform(category: CategoryData): string {
        if (!category.privacyContexts) {
            return category.fullName;
        }

        let result = `${category.fullName}\n`;

        if (category.privacyContext) {
            const title = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.privacyContext');
            result += `${title}: ${category.privacyContext}\n`;
        }

        if (category.privacy) {
            const title = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.contentPrivacy');
            let value = '';
            switch (category.privacy) {
                case KalturaPrivacyType.all:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.noRestriction');
                    break;
                case KalturaPrivacyType.authenticatedUsers:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.requiresAuth');
                    break;
                case KalturaPrivacyType.membersOnly:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.noMembers');
                    break;
                default:
                    break;
            }

            if (!!value) {
                result += `${title}: ${value}\n`;
            }
        }

        if (category.appearInList) {
            let value = '';
            let title = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.categoryListing');
            switch (category.appearInList) {
                case KalturaAppearInListType.categoryMembersOnly:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.private');
                    break;
                case KalturaAppearInListType.partnerOnly:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.noRestriction');
                    break;
                default:
                    break
            }

            if (!!value) {
                result += `${title}: ${value}\n`;
            }

            value = '';
            title = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.contributionPolicy');

            switch (category.contributionPolicy) {
                case KalturaContributionPolicyType.all:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.noRestriction');
                    break;
                case KalturaContributionPolicyType.membersWithContributionPermission:
                    value = this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.private');
                    break;
                default:
                    break;
            }

            if (!!value) {
                result += `${title}: ${value}\n`;
            }

            if (category.membersCount > 0) {
                result += this._appLocalization.get('applications.entries.entryMetadata.categoryTooltip.specificEndUserPermissions');
            }
        }

        return result;
    }
}
