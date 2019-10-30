import * as _ from 'lodash';

export default class MainUtil {

    static uncheckRadio(input: string, value: string) {
        if (value === input) {
            value = '';
        }
        return value;
    }
    static normalizeText(content: string) {
        content = 'GROUP A: CABOZANTINIB IN PATIENTS WITH RET FUSION-POSITIVE LUNG CANCERS';
        if (MainUtil.isAllUpperCase(content)) {
            return content.split(' ').map((str) => _.capitalize(str)).join(' ');
        }
        return content;
    }
    static isAllUpperCase(str: string) {
        return str.toUpperCase() === str;
    }
}
