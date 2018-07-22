
import {
	MetadataProfile, MetadataItemTypes, MetadataItem
} from './metadata-profile';
import { KalturaUtils, XmlParser } from '@kaltura-ng/kaltura-common';


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
			isRequired: element.attr.minOccurs ? element.attr.minOccurs.value + '' === '1' : false,
			allowMultiple: element.attr.maxOccurs ? element.attr.maxOccurs.value + '' === 'unbounded' : false,
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
		    // DEVELOPER NOTICE: due to bug in kaltura server the parse logic should ignore empty string and 'false' value
			if (kalturaMetadataProfile.xsd && kalturaMetadataProfile.xsd !== 'false' && kalturaMetadataProfile.xsd !== '<xml></xml>') {

			    const escapedSchema = kalturaMetadataProfile.xsd.replace(/&(?![^ ]+;)/g, '&amp;');
				const schemaContext: any = XmlParser.toJson(escapedSchema, false);
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
                result = {profile: null};
			}
		}
		catch (e) {
            console.warn("[kaltura] -> Error occured: " + e.message);
			result = {profile: null};
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

  private _extractMetadataItemType(type: MetadataItemTypes): string {
    switch (type) {
      case MetadataItemTypes.Text:
        return 'textType';
      case MetadataItemTypes.Date:
        return 'dateType';
      case MetadataItemTypes.List:
        return 'listType';
      case MetadataItemTypes.Object:
        return 'objectType';
      default:
        return '';
    }
  }

  private _convertMetadataItems(items: MetadataItem[]): object[] {
    return items.map(item => {
      const result = {
        'attr': {
          'id': item.id,
          'name': item.name,
          'minOccurs': 0,
          'maxOccurs': item.allowMultiple ? 'unbounded' : 1
        },
        'annotation': {
          'documentation': { 'text': item.documentations },
          'appinfo': {
            'noprefix:label': { 'text': item.label },
            'noprefix:key': { 'text': item.key },
            'noprefix:searchable': { 'text': String(!!item.isSearchable) },
            'noprefix:timeControl': { 'text': String(!!item.isTimeControl) },
            'noprefix:description': { 'text': item.description }
          }
        }
      };

      if (item.type !== MetadataItemTypes.List) {
        Object.assign(result.attr, { 'type': this._extractMetadataItemType(item.type) });
      } else {
        Object.assign(result, {
          'simpleType': {
            'restriction': {
              'attr': { 'base': this._extractMetadataItemType(item.type) },
              'enumeration': [...item.optionalValues.map(option => ({ 'attr': { 'value': KalturaUtils.escapeXml(option.value) } }))]
            }
          }
        });
      }

      return result;
    });
  }

  public generateSchema(parsedProfile: MetadataProfile): string {
    let result = '';

    const schemaObject = {
      'attr': { 'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema' },
      'element': {
        'attr': { 'name': 'metadata' },
        'complexType': {
          'sequence': {
            'element': [...this._convertMetadataItems(parsedProfile.items)]
          }
        }
      },
      'complexType': [
        {
          'attr': { 'name': 'textType' },
          'simpleContent': {
            'extension': {
              'attr': { 'base': 'xsd:string' },
              'text': null
            }
          }
        },
        {
          'attr': { 'name': 'dateType' },
          'simpleContent': {
            'extension': {
              'attr': { 'base': 'xsd:long' },
              'text': null
            }
          }
        },
        {
          'attr': { 'name': 'objectType' },
          'simpleContent': {
            'extension': {
              'attr': { 'base': 'xsd:string' },
              'text': null
            }
          }
        }
      ],
      'simpleType': {
        'attr': { 'name': 'listType' },
        'restriction': {
          'attr': { 'base': 'xsd:string' },
          'text': null
        }
      }
    };

    try {
      result = XmlParser.toXml(schemaObject, 'schema', 'xsd');
    } catch (e) {
      console.error(e);
    }

    return result;
  }

}
