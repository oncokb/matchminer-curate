export interface NcitDrug {
    name: string,
    codes: Array<string>,
    synonyms?: Array<string>,
    category: string,
    count: number
}

export interface Drug {
    name: string,
    ncit_code?: string,
    synonyms?: string
}
