
export interface ModulesConfig {
    contentShared: {
        categories: {
            categoriesStatusSampleInterval: number,
            subCategoriesLimit: number,
            maxTreeItemChildrenToShow: number
        }
    };
}

export const modulesConfig: ModulesConfig = {
    'contentShared': {
        'categories': {
            'categoriesStatusSampleInterval': 30,
            'subCategoriesLimit': 100,
            'maxTreeItemChildrenToShow': 500
        }
    }
};
