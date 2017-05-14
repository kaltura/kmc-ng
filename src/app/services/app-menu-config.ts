
export declare type AppMenuConfig = AppMenuItem[];
export interface AppMenuItem {
    routePath?: string;
    titleToken : string;
    children?: AppMenuItem[];
}
export function validateConfig(config: AppMenuConfig): void {
    // todo [kmcng]: check config validity
}
