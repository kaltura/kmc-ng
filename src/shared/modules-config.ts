
export interface ModulesConfig {
    shared: {
        lists: {
            maxItems: number,
            defaultPageSize: number,
            defaultSortOrder: number
        }
    }
    contentShared: {
        categories: {
            categoriesStatusSampleInterval: number,
            subCategoriesLimit: number,
            maxTreeItemChildrenToShow: number
        }
    }
}

export const modulesConfig: ModulesConfig = {
    'shared': {
        'lists': {
            'maxItems': 10000,
            'defaultPageSize': 50,
            'defaultSortOrder': -1
        }
    },
    'contentShared': {
        'categories': {
            'categoriesStatusSampleInterval': 30,
            'subCategoriesLimit': 50,
            'maxTreeItemChildrenToShow': 500
        }
    }
}
