type MatchFunc<M, R, Key extends keyof M> = (data: M[Key]) => R
type Matcher<R, M> = {
  [key in keyof M]: MatchFunc<M, R, key>
}
type MatcherPartial<R, M> = Partial<Matcher<R, M>> & { _(arg: any): R }

/**
 * Base class for enums that each variants can hold a value.
 * 
 * Generic type M should be:
 * ```ts
 * {
 *   VariantName: VariantType
 * }
 * ```
 * 
 * For example, `Result<T, E>` class is defined as:
 * ```ts
 * class Result<T, E> extends EnumBase<{ Ok: T, Err: E }>
 * ```
 */
export class EnumBase<M> {
  protected data: M[keyof M]

  constructor(protected variant: keyof M, value: M[typeof variant]) {
    this.data = value
  }

  /**
   * ## pattern match
   * 
   * There are two possible parameters.
   * 
   * * state all patterns:
   * 
   * ```ts
   * r1.match({
   *   Ok: (value)=> {},
   *   Err: (e)=> {}
   * })
   * ```
   * 
   * * abbreviate some patterns:
   * 
   * ```ts
   * r1.match({
   *   Ok: (value)=> {},
   *   _:()=>{}
   * })
   * ```
   * 
   * ## Return Value
   * 
   * This method returns the value returned by pattern match handlers
   */
  match<R>(obj: Matcher<R, M>): R;
  match<R>(obj: MatcherPartial<R, M>): R;
  match<R>(obj: Matcher<R, M> | MatcherPartial<R, M>): R {
    const getter = obj[this.variant] as MatchFunc<M, R, typeof this.variant> | undefined
    if (getter) return getter(this.data)
    return (obj as MatcherPartial<R, M>)._(this.data)
  }
  /**
   * ```ts
   * if (
   *   r1.if_let('Ok', (value)=>{
   *     // when r1 is Ok
   *   })
   * ) {
   *   // do things such as `break`, `continue`, `return`
   * } else {
   *   // when r1 is not Ok
   * }
   * ```
   * @param v_name variant name
   * @returns `true` if variant matches. `false` otherwise.
   */
  if_let<Variant extends keyof M>(v_name: Variant, then: (value: M[Variant]) => void): boolean {
    if (this.variant === v_name) {
      then(this.data as M[Variant])
      return true
    }
    return false
  }
}
type EnumConsturctor<M> = { new(...args: any[]): EnumBase<M> };

type EnumWithVariantFuncs<M, C extends EnumConsturctor<M>> = C & {
  [variantName in keyof M]: <T>(
    data: T
  ) => C
}

export function variants<M>(
  ...variantNames: (keyof M)[]
) {
  return function <T extends EnumConsturctor<M>>(BaseClass: T) {
    const NC = class extends BaseClass { };
    for (const variant of variantNames) {
      Object.defineProperty(NC, variant, {
        value(store: M[typeof variant]) {
          return new NC(variant, store)
        },
      })
    }
    return NC as EnumWithVariantFuncs<M, T>
  }
}

/**
 * `Result` is a type that represents either success `Ok` or failure `Err`.
 * 
 * ```ts
 * const r1: Result<number, string> = Ok(56);
 * const r2: Result<number, string> = Err('error happened');
 * ```
 */
export class Result<T, E> extends EnumBase<{ Ok: T, Err: E }> {
  /** Contains the success value */
  static Ok<NT>(data: NT) {
    return new Result<NT, any>('Ok', data)
  }
  /** Contains the error value */
  static Err<NE>(err: NE) {
    return new Result<any, NE>('Err', err)
  }
  /**
   * Returns the contained `Ok` value or computes it from a closure.
   */
  unwrap_or_else(back: (arg: E) => T): T {
    if (this.variant === 'Ok') {
      return this.data as T
    }
    return back(this.data as E)
  }
  /**
   * Returns the contained `Ok` value.
   * 
   * Throws Error with a custom error message if the value is `None`.
   */
  expect(msg: string): T {
    return this.unwrap_or_else(err => {
      if (err instanceof Error) throw err
      else throw new Error(msg + ": " + String(err))
    });
  }
  /**
   * Returns the contained `Ok` value.
   * 
   * Throws Error if the self value is `Err`
   */
  unwrap(): T {
    return this.unwrap_or_else(err => {
      if (err instanceof Error) throw err
      else throw new Error(String(err))
    });
  }
  /**
  * Returns the contained `Ok` value or a provided default.
  * 
  * ```ts
  * 
  * Ok(15).unwrap_or(0) === 15
  * 
  * Err('error').unwrap_or(0) === 0
  * ```
  */
  unwrap_or(value: T): T {
    if (this.variant === 'Ok') {
      return this.data as T
    }
    return value
  }
  /**
   * Converts from `Result<T, E>` to `Option<T>`.
   */
  ok(): Option<T> {
    if (this.variant === 'Ok') {
      return Some(this.data as T)
    }
    return None
  }
  /**
   * Returns `true` if the result is `Ok`
   */
  is_ok() {
    return this.variant === 'Ok'
  }
  /**
   * Returns `true` if the result is `Err`
   */
  is_err() {
    return this.variant === 'Err'
  }
  q(resolve: (value: Result<T, E> | PromiseLike<Result<T, E>>) => void): T {
    if (this.variant === 'Err') resolve(this)
    return this.data as T
  }
}

export const { Ok, Err } = Result

/**
 * Type `Option` represents an optional value.
 *
 * every `Option<T>` is either:
 * - `Some` which contains a value of type `T`.
 * - `None`, which does not contain a value. 
 * 
 * ```ts
 * const o1: Option<number> = Some(56);
 * const o2: Option<number> = None;
 * ```
 */
export class Option<T> extends EnumBase<{ Some: T, None: undefined }> {
  /** Some value. */
  static Some<NT>(data: NT) {
    return new Option<NT>("Some", data)
  }
  /** No value. */
  static None = new Option<any>("None", undefined)
  /**
   * Returns the contained `Some` value or computes it from a closure.
   */
  unwrap_or_else(back: () => T): T {
    if (this === None) {
      return back()
    }
    return this.data as T
  }
  /**
   * Returns the contained `Some` value.
   * 
   * Throws Error with a custom error message if the value is `None`.
   */
  expect(msg: string): T {
    return this.unwrap_or_else(() => {
      throw new Error(msg)
    })
  }
  /**
   * Returns the contained `Some` value.
   * 
   * Throws Error if the self value equals `None`
   */
  unwrap(): T {
    return this.unwrap_or_else(() => {
      throw new Error("unwrapping None")
    });
  }
  /**
   * Returns the contained `Some` value or a provided default.
   * 
   * ```ts
   * 
   * Some("car").unwrap_or("bike") === "car"
   * 
   * None.unwrap_or("bike") === "bike"
   * ```
   */
  unwrap_or(value: T): T {
    if (this === None) {
      return value
    }
    return this.data as T
  }
  /**
   * Transforms the `Option<T>` into a `Result<T, E>`, 
   * 
   * mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
   */
  ok_or<E>(err: E): Result<T, E> {
    if (this === None) {
      return Err(err)
    }
    return Ok(this.data as T)
  }
  /**
   * Returns `true` if the option is `None`
   */
  is_none() {
    return this === None
  }
  /**
   * Returns `true` if the option is `Some`
   */
  is_some() {
    return !this.is_none()
  }
}

export const { Some, None } = Option