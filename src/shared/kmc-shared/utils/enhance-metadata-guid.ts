import { MetadataProfile } from 'app-shared/kmc-shared';

// metadata items GUID might not be unique
// use profile id to enhance profile item guid
export function enhanceMetadataGuid(metadataProfiles: MetadataProfile[]): MetadataProfile[] {
    if (Array.isArray(metadataProfiles)) {
        return metadataProfiles.map(item =>
            Array.isArray(item.items)
                ? { ...item, items: item.items.map(subItem => ({ ...subItem, id: `${item.id}_${subItem.id}` })) }
                : item
        );
    }

    return metadataProfiles;
}
