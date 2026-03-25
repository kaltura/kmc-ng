import {
    ESearchSearchUserAction, KalturaESearchItemType,
    KalturaESearchOperatorType, KalturaESearchUserFieldName, KalturaESearchUserItem,
    KalturaESearchUserOperator,
    KalturaESearchUserParams, KalturaFilterPager
} from 'kaltura-ngx-client';

export const buildUserSearchQuery = (text: string) => {
    return new ESearchSearchUserAction({
        searchParams: new KalturaESearchUserParams({
            searchOperator: new KalturaESearchUserOperator({
                operator: KalturaESearchOperatorType.orOp,
                searchItems: [
                    new KalturaESearchUserItem({
                        itemType: KalturaESearchItemType.startsWith,
                        fieldName: KalturaESearchUserFieldName.screenName,
                        searchTerm: text
                    }),
                    new KalturaESearchUserItem({
                        itemType: KalturaESearchItemType.startsWith,
                        fieldName: KalturaESearchUserFieldName.firstName,
                        searchTerm: text.split(" ")[0]
                    }),
                    new KalturaESearchUserItem({
                        itemType: KalturaESearchItemType.partial,
                        fieldName: KalturaESearchUserFieldName.lastName,
                        searchTerm: text
                    }),
                    new KalturaESearchUserItem({
                        itemType: KalturaESearchItemType.startsWith,
                        fieldName: KalturaESearchUserFieldName.userId,
                        searchTerm: text
                    }),
                    new KalturaESearchUserItem({
                        itemType: KalturaESearchItemType.partial,
                        fieldName: KalturaESearchUserFieldName.screenName,
                        searchTerm: text
                    }),
                    new KalturaESearchUserItem({
                        itemType: KalturaESearchItemType.partial,
                        fieldName: KalturaESearchUserFieldName.userId,
                        searchTerm: text
                    }),
                    new KalturaESearchUserItem({
                        itemType: KalturaESearchItemType.exactMatch,
                        fieldName: KalturaESearchUserFieldName.email,
                        searchTerm: text
                    }),
                    new KalturaESearchUserItem({
                        itemType: KalturaESearchItemType.startsWith,
                        fieldName: KalturaESearchUserFieldName.fullName,
                        searchTerm: text
                    }),
                    new KalturaESearchUserItem({
                        itemType: KalturaESearchItemType.partial,
                        fieldName: KalturaESearchUserFieldName.fullName,
                        searchTerm: text
                    })
                ]
            })
        }),
        pager: new KalturaFilterPager({
            pageIndex : 0,
            pageSize : 50
        })
    });
}
