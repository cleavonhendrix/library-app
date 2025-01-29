export interface BookQuery {
    bookTitle?: string;
    author?: string;
    yearPublished?: string;
    isbn?: string;
    genre?: string;
    series?: string;
    limit?: number;
    offset?: number;
}

export interface BookDetails {
    id?: number;
    bookTitle: string;
    author: string;
    yearPublished: string;
    isbn: string;
    genre: string;
    series: string;
}