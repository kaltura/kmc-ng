
import {
	MetadataProfile, MetadataItemTypes, MetadataItem
} from './metadata-profile';
import { XmlParser } from '@kaltura-ng/kaltura-common';


import { KalturaMetadataProfile } from 'kaltura-ngx-client/api/types/KalturaMetadataProfile';

import {
	KalturaMetadataProfileStatus
} from 'kaltura-ngx-client/api/types/KalturaMetadataProfileStatus'


export class MetadataProfileParser {
	private _extractElementType(element: any): MetadataItemTypes {
		let result: MetadataItemTypes;
		const elementType = element.attr.type ? element.attr.type.value : '';

		switch (elementType) {
			case "textType":
				result = MetadataItemTypes.Text;
				break;
			case "dateType":
				result = MetadataItemTypes.Date;
				break;
			case "listType":
				result = MetadataItemTypes.List;
				break;
			case "objectType":
				result = MetadataItemTypes.Object;
				break;
			default:
				if (element.simpleType) {
					// for backward compatibility
					result = MetadataItemTypes.List;
				} else {
					result = MetadataItemTypes.Container;
				}
				break;
		}

		return result;
	}


	private _extractElementItem(element: any): MetadataItem {
		let result: MetadataItem = null;

		result = {
			type: this._extractElementType(element),
			name: element.attr.name ? element.attr.name.value : '',
			id: element.attr.id ? element.attr.id.value : '',
			isRequired: element.attr.minOccurs.value + '' === '1',
			allowMultiple: element.attr.maxOccurs.value + '' === 'unbounded',
			optionalValues: [],
			children: []
		};

		if (element.complexType && element.complexType.sequence) {
			let elementItems = element.complexType.sequence.element;
			elementItems = elementItems instanceof Array ? elementItems : elementItems ? [elementItems] : null;
			if (elementItems) {
				elementItems.forEach(elementItem => {
					result.children.push(this._extractElementItem(elementItem));
				});
			}
		}

		if (element.simpleType && element.simpleType.restriction && element.simpleType.restriction.enumeration) {
			let elementItems = element.simpleType.restriction.enumeration;
			elementItems = elementItems instanceof Array ? elementItems : elementItems ? [elementItems] : null;
			if (elementItems) {
				elementItems.forEach(elementItem => {
					const elementValue = elementItem.attr.value  ? elementItem.attr.value.value+'' : null;
					if (elementValue) {
						result.optionalValues.push(
							{
								value: elementValue,
								text: elementValue
							}
						);
					}
				});
			}
		}

		this._updateItemInfo(element, result);

		return result;
	}

	public parse(kalturaMetadataProfile: KalturaMetadataProfile): {  profile: MetadataProfile, error?: Error } {

		let result;

		try {
			if (kalturaMetadataProfile.xsd) {

				const schemaContext: any = XmlParser.toJson(kalturaMetadataProfile.xsd);
				const metadataElement = schemaContext.schema.element;

				if (metadataElement.attr.name.value === 'metadata') {
					const parsedProfile: MetadataProfile = {
						id: kalturaMetadataProfile.id,
						name: kalturaMetadataProfile.name,
						isActive: kalturaMetadataProfile.status === KalturaMetadataProfileStatus.active,
						items: []
					};

					if (metadataElement.complexType && metadataElement.complexType.sequence)
					{
						let metadataItems = metadataElement.complexType.sequence.element;
						metadataItems = metadataItems instanceof Array ? metadataItems : metadataItems ? [metadataItems] : null;
						if (metadataItems) {
							metadataItems.forEach(elementItem => {
								parsedProfile.items.push(this._extractElementItem(elementItem));
							});
						}
					}

					result = {profile: parsedProfile};

				} else {
					result = {profile: null, error: new Error('missing metadata profile xsd')};
					console.warn("[kaltura] -> invalid secnario. first element must be 'metadata'");
				}
			} else {
				result = {profile: null, error: new Error('missing metadata profile xsd')};
			}
		}
		catch (e) {
			result = {profile: null, error: e};
		}

		return result;
	}

	private _updateItemInfo(element: any, item: MetadataItem): void {

		const annotation = element.annotation;

		if (annotation) {
			if (annotation.documentation) {
				item.documentations = annotation.documentation.text;
			}

			if (annotation.appinfo) {
				item.label = annotation.appinfo.label && annotation.appinfo.label.text ? annotation.appinfo.label.text : '';
				item.key = annotation.appinfo.key && annotation.appinfo.key.text ? annotation.appinfo.key.text : '';
				item.isSearchable = annotation.appinfo.searchable && annotation.appinfo.searchable.text;
				item.isTimeControl = annotation.appinfo.timeControl && annotation.appinfo.timeControl.text;
				item.description = annotation.appinfo.description && annotation.appinfo.description.text ? annotation.appinfo.description.text : '';

			}
		}
	}

}
