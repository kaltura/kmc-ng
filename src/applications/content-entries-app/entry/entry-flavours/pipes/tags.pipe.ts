// this pipe simply adds spaces between tags in the tags string to enable word wrapping
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'tags'})
export class TagsPipe implements PipeTransform {

	transform(tags: string): string {
		let prettyTags = "";
		const tagsArr = tags.split(",");
		tagsArr.forEach((tag, index) => {
			prettyTags += tag.trim();
			if (index < tagsArr.length -1){
				prettyTags += ", ";
			}
		});
		return prettyTags;
	}
}
