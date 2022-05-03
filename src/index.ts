type MatchFunc<M, R, Key extends keyof M> = (data: M[Key]) => R
type Matcher<R, M> = {
  [key in keyof M]: MatchFunc<M, R, key>
}
type MatcherPartial<R, M> = Partial<Matcher<R, M>> & { _(arg: any): R }


export class EnumBase<M> {
  protected data: M[keyof M]

  constructor(protected variant: keyof M, value: M[typeof variant]) {
    this.data = value
  }

  match<R>(obj: Matcher<R, M>): R;
  match<R>(obj: MatcherPartial<R, M>): R;
  match<R>(obj: Matcher<R, M> | MatcherPartial<R, M>): R {
    const getter = obj[this.variant] as MatchFunc<M, R, typeof this.variant> | undefined
    if (getter) return getter(this.data)
    return (obj as MatcherPartial<R, M>)._(this.data)
  }
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

export class Result<T, E> extends EnumBase<{ Ok: T, Err: E }> {
  static Ok<NT>(data: NT) {
    return new Result<NT, any>('Ok', data)
  }
  static Err<NE>(err: NE) {
    return new Result<any, NE>('Err', err)
  }
  unwrap_or_else(back: (arg: E) => T): T {
    if (this.variant === 'Ok') {
      return this.data as T
    }
    return back(this.data as E)
  }
  expect(msg: string): T {
    return this.unwrap_or_else(() => {
      throw new Error(msg)
    })
  }
  unwrap(): T {
    return this.unwrap_or_else(err => {
      if (err instanceof Error) throw err
      else throw new Error(String(err))
    });
  }
  unwrap_or(value: T): T {
    if (this.variant === 'Ok') {
      return this.data as T
    }
    return value
  }
  is_ok() {
    return this.variant === 'Ok'
  }
  is_err() {
    return this.variant === 'Err'
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
  q(resolve: (value: Result<T, E> | PromiseLike<Result<T, E>>) => void): T {
    if (this.variant === 'Err') resolve(this)
    return this.data as T
  }
}

export const { Ok, Err } = Result

export class Option<T> extends EnumBase<{ Some: T, None: undefined }> {
  static Some<NT>(data: NT) {
    return new Option<NT>("Some", data)
  }
  static None = new Option<any>("None", undefined)

  unwrap_or_else(back: () => T): T {
    if (this === None) {
      return back()
    }
    return this.data as T
  }
  expect(msg: string): T {
    return this.unwrap_or_else(() => {
      throw new Error(msg)
    })
  }
  unwrap(): T {
    return this.unwrap_or_else(() => {
      throw new Error("unwrapping None")
    });
  }
  unwrap_or(value: T): T {
    if (this === None) {
      return value
    }
    return this.data as T
  }
  /**
   * Transforms the `Option<T>` into a `Result<T, E>`, 
   * mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
   */
  ok_or<E>(err: E): Result<T, E> {
    if (this === None) {
      return Err(err)
    }
    return Ok(this.data as T)
  }
  is_none() {
    return this === None
  }
  is_some() {
    return !this.is_none()
  }
}

export const { Some, None } = Option