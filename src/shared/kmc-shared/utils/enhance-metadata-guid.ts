import { MetadataProfile } from 'app-shared/kmc-shared';

// metadata items GUID might not be unique
// use profile id to enhance profile item guid
export function enhanceMetadataGuid(metadataProfiles: MetadataProfile[]): void {
    metadataProfiles.forEach(item => {
        item.items.forEach(subItem => {
            subItem.id = `${item.id}_${subItem.id}`;
        });
    });
}
