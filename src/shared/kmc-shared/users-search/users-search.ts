import {
    ESearchSearchUserAction, KalturaESearchItemType,
    KalturaESearchOperatorType, KalturaESearchUserFieldName, KalturaESearchUserItem,
    KalturaESearchUserOperator,
    KalturaESearchUserParams, KalturaFilterPager, KalturaUser
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
export const isHashed = (str: string): boolean => {
    const regex = /^[a-z0-9]{64}$/;
    return regex.test(str);
}

export const getFriendlyUserName = (user: KalturaUser | null): string => {
    if (!user) {
        return '';
    }
    let userName = '';
    if (user.fullName && !isHashed(user.fullName)) {
        return user.fullName;
    } else if (user.screenName && !isHashed(user.screenName)) {
        return user.screenName;
    } else if (user.id && !isHashed(user.id)) {
        return user.id;
    } if (user.email && !isHashed(user.email)) {
        return  user.email;
    }
    return userName;
}
