
export interface SharedModulesConfig {
    entriesShared: {
        pageSize: number,
        MAX_ENTRIES: number,
        categoriesFilters: {
            maxChildrenToShow: number
        }
    },
    categoriesShared: {
        MAX_CATEGORIES: number,
        categoriesStatusSampleInterval: number,
        categoriesFilters: {
            maxChildrenToShow: number
        },
        SUB_CATEGORIES_LIMIT: number
    },
    rolesShared: {
        MAX_ROLES: number,
        rolesFilters: {
            maxChildrenToShow: number
        }
    },
    uploadsShared: {
        MAX_FILE_SIZE: number, // Mb
        MAX_CONCURENT_UPLOADS: number
    }
}

export const sharedModulesConfig: SharedModulesConfig = {
    "entriesShared": {
        "pageSize": 50,
        "MAX_ENTRIES": 10000,
        "categoriesFilters": {
            "maxChildrenToShow": 500
        }
    },
    "categoriesShared": {
        "MAX_CATEGORIES": 10000,
        "categoriesStatusSampleInterval": 30,
        "categoriesFilters": {
            "maxChildrenToShow": 500
        },
        "SUB_CATEGORIES_LIMIT": 50
    },
    "rolesShared": {
        "MAX_ROLES": 10000,
        "rolesFilters": {
            "maxChildrenToShow": 500
        }
    },
    "uploadsShared": {
        "MAX_FILE_SIZE": 2047, // Mb
        "MAX_CONCURENT_UPLOADS": 4
    }
}