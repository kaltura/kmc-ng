import {AbstractControl} from "@angular/forms";

export function PhoneValidator(control: AbstractControl): {[key: string]: boolean}  {
  if (control.value) {
    // validate that value contains only hyphens and at least 7 digits
    if (!(/(^[0-9]+[-]*[0-9]+$)/.test(control.value)) || !(control.value.replace(/[^0-9]/g, '').length >= 7)) {
      return {phonePattern: true};
    }
  }
  return null;
}
