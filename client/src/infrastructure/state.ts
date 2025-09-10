export type StateNamed<T = 'NULL'> = {
    type: T;
}

export type StateEmpty = StateNamed<'EMPTY'>;

export type StateLoading = StateNamed<'LOADING'> & {
    startedTime: Date;
}

export type StateError<TError = undefined> = StateNamed<'ERROR'> & {
    error: TError;
}

export type StateSuccess<TResult = Record<string, never>> = StateNamed<'SUCCESS'> & {
    result: TResult;
}

export type StateDeleted<TResult = Record<string, never>> = StateNamed<'DELETED'> & {
    result: TResult;
}

export type StateFetchedBatch<TResult, TError = Record<string, never>> =
    StateEmpty
    | StateLoading
    | StateError<TError>
    | StateSuccess<TResult>;

export type StateFetchedDeletableBatch<TResult, TError, TDeleteResult> =
    StateFetchedBatch<TResult, TError>
    | StateDeleted<TDeleteResult>;
