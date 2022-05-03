declare type MatchFunc<M, R, Key extends keyof M> = (data: M[Key]) => R;
declare type Matcher<R, M> = {
    [key in keyof M]: MatchFunc<M, R, key>;
};
declare type MatcherPartial<R, M> = Partial<Matcher<R, M>> & {
    _(arg: any): R;
};
declare class EnumBase<M> {
    protected variant: keyof M;
    protected data: M[keyof M];
    constructor(variant: keyof M, value: M[typeof variant]);
    match<R>(obj: Matcher<R, M>): R;
    match<R>(obj: MatcherPartial<R, M>): R;
    if_let<Variant extends keyof M>(v_name: Variant, then: (value: M[Variant]) => void): boolean;
}
declare type EnumConsturctor<M> = {
    new (...args: any[]): EnumBase<M>;
};
declare type EnumWithVariantFuncs<M, C extends EnumConsturctor<M>> = C & {
    [variantName in keyof M]: <T>(data: T) => C;
};
declare function variants<M>(...variantNames: (keyof M)[]): <T extends EnumConsturctor<M>>(BaseClass: T) => EnumWithVariantFuncs<M, T>;
declare class Result<T, E> extends EnumBase<{
    Ok: T;
    Err: E;
}> {
    static Ok<NT>(data: NT): Result<NT, any>;
    static Err<NE>(err: NE): Result<any, NE>;
    unwrap_or_else(back: (arg: E) => T): T;
    expect(msg: string): T;
    unwrap(): T;
    unwrap_or(value: T): T;
    is_ok(): boolean;
    is_err(): boolean;
    /**
     * Converts from `Result<T, E>` to `Option<T>`.
     */
    ok(): Option<T>;
    q(resolve: (value: Result<T, E> | PromiseLike<Result<T, E>>) => void): T;
}
declare const Ok: typeof Result.Ok;
declare const Err: typeof Result.Err;
declare class Option<T> extends EnumBase<{
    Some: T;
    None: undefined;
}> {
    static Some<NT>(data: NT): Option<NT>;
    static None: Option<any>;
    unwrap_or_else(back: () => T): T;
    expect(msg: string): T;
    unwrap(): T;
    unwrap_or(value: T): T;
    /**
     * Transforms the `Option<T>` into a `Result<T, E>`,
     * mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
     */
    ok_or<E>(err: E): Result<T, E>;
    is_none(): boolean;
    is_some(): boolean;
}
declare const Some: typeof Option.Some;
declare const None: Option<any>;

export { EnumBase, Err, None, Ok, Option, Result, Some, variants };
