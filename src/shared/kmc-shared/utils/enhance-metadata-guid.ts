import { MetadataProfile } from 'app-shared/kmc-shared';

// metadata items GUID might not be unique
// use profile id to enhance profile item guid
export function enhanceMetadataGuid(metadataProfiles: MetadataProfile[]): void {
    if (Array.isArray(metadataProfiles)) {
        metadataProfiles.forEach(item => {
            if (Array.isArray(item.items)) {
                item.items.forEach(subItem => {
                    subItem.id = `${item.id}_${subItem.id}`;
                });
            }
        });
    }
}
