import { Injectable } from '@angular/core';

@Injectable()
export class MainutilService {

    constructor() { }

    unCheckRadio(input, value) {
        if (value === input) {
            value = '';
        }
        return value;
    }
}
