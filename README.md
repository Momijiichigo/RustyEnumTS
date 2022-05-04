# Rust-like Enums in TS

TS implementation of Rust-like enums (e.g. `Option<T>`, `Result<T, E>`)

Just like in rust, this makes you able to use enums with custom values.
It works with Typescript.
## Installation

For Node:

```sh
npm i rusty-enums
```

For Deno:

```ts
import { /* imports you use */ } from 'https://cdn.skypack.dev/rusty-enums?dts'
```

## Provided Classes

Available methods for Enum:
- match
- if_let

Available `Result<T, E>` methods:
- unwrap
- expect
- unwrap_or
- unwrap_or_else
- ok
- is_ok
- is_err

Available `Option<T>` methods:
- unwrap
- expect
- unwrap_or
- unwrap_or_else
- ok_or
- is_some
- is_none

## Usage

```ts
import { Result, Ok, Err, Option, Some, None } from './index.ts'

const hello = {} as {
    dessert: Option<string>,
    success: Result<number, Error>
}
hello.dessert = Some('Pudding')

console.log(
      "I will eat some "+
      hello.dessert.unwrap_or('Apple') // if `hello.dessert` is `None`, 'Apple' will be returned.
)

hello.success = Ok(34)  // You can do `Result.Ok(34)` as well
const num = hello.success.match({
    Ok: (value) => value * 3,
    _: () => 0  // You can choose to abbreviate several variants
})

// convert Result<T, E> to Option<T>

const r1: Result<number, string> = Ok(45)
const o1 = r.ok() // o: Option<number>

// convert Option<T> to Result<T, E>

const r1: Option<string> = Some(3)
const o1 = r.ok_or('r1 is none') // o: Result<number, string>
```

## Define your own Enum

`EnumBase` class is provided.

```ts
class MyEnum<T> extends EnumBase<{ A: T, B: T, Nope: undefined }> {
  static A<NT>(data: NT): MyEnum<NT> {
    return new MyEnum('A', data)
  }
  static Nope = new MyEnum<any>('Nope', undefined)
  
  // -- snip ---
}
const myEnum = MyEnum.A(56) // MyEnum<number>
myEnum.match({
  A: (num)=> console.log(`variant A and value is ${num}`),
  B: (num)=> console.log(`variant B and value is ${num}`),
  Nope: () => console.log(`variant Nope`),
})

```