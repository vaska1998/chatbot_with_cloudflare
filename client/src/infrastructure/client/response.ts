type ClientBaseResponse<RType = 'NULL'> = {
    type: RType;
    status: number;
    statusText: string;
}

export type ClientSuccessResponse<TResult = undefined> = ClientBaseResponse<'SUCCESS'> & {
    result: TResult;
}

export type ClientErrorResponse = ClientBaseResponse<'ERROR'> & {
    error: string;
    errorMessage: string | string[];
}

export type ClientResponse<TResult = undefined> = ClientSuccessResponse<TResult> | ClientErrorResponse;
