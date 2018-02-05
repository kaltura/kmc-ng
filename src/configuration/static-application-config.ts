
export interface StaticApplicationConfig {
    shell: {
        browser: {
            errorRoute: string,
            loginRoute: string,
            storageNamespace: string
        }
    },
    core: {
        kaltura: {
            useHttpsProtocol: boolean,
        },
        menuConfig: {
            routePath: string,
            titleToken: string,
            showSubMenu: boolean,
            enabled: boolean,
            children?: {
                routePath: string,
                titleToken: string,
                enabled: boolean,
                position?: string
            }[]
        }[],
        locales: {
            id: string,
            label: string
        }[]
    }
}
