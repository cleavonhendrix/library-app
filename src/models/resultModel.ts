export interface Result<T> {
    status: 'SUCCESS' | 'FAILED';
    code: number;
    message: string;
    data?: T;
    errors?: any;
    limit?: number;
    offset?: number;
    total?: number;
}

export interface ErrorResult {
    status: 'SUCCESS' | 'FAILED';
    code: number;
    message: string;
}