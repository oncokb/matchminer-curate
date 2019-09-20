export interface Geneset {
    name: string,
    uuid: number,
    genes: Gene[]
}

export interface Gene {
    entrezGeneId: number,
    hugoSymbol: string,
    name: string,
    oncogene: boolean,
    curatedIsoform: string,
    curatedRefSeq: string,
    geneAliases: string[],
    tsg: boolean
}

export interface GenesetOption {
    name: string,
    uuid: number,
    genes: string[]
}
