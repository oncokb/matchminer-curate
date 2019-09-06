export interface Geneset {
    name: string,
    id: number,
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
    genesets: string[],
    tsg: boolean
}

export interface GenesetOption {
    name: string,
    id: number,
    genes: string[]
}
