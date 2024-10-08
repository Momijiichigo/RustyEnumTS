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

## Usage

```ts
import { Result, Ok, Err, Option, Some, None } from 'rusty-enums'

const hello: {
    dessert: Option<string>,
    success: Result<number, Error>
} = {
    dessert: Some('Pudding'), // You can do `Option.Some('Pudding')` as well
    success: Ok(34)
}

console.log(
      "I will eat some "+
      hello.dessert.unwrap_or('Apple') // if `hello.dessert` is `None`, 'Apple' will be returned.
)

const num = hello.success.match({
    Ok: (value) => value * 3,
    _: () => 0  // You can choose to abbreviate variants
})

// convert Result<T, E> to Option<T>

const r1: Result<number, string> = Ok(45)
const o1 = r1.ok() //  type: `Option<number>`

// convert Option<T> to Result<T, E>

const o2: Option<number> = Some(3)
const r2 = o2.ok_or('o2 is none') // type: `Result<number, string>`
```

### Define your own Enum

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

## Available Features

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
- insert
- get_or_insert
- get_or_insert_with
- is_some
- is_none
