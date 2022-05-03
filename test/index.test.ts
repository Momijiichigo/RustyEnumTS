import { Result, Ok, Err, Option, Some, None } from '../src/index'


test('Result', () => {
    let o: Result<number, string> = Ok(5)
    expect(o.unwrap()).toBe(5);
    expect(o.unwrap_or_else((msg) => msg.length)).toBe(5)
    expect(o.unwrap_or(10)).toBe(5)
    expect(
        o.match({
            Ok: (num) => num,
            Err: () => 7
        })
    ).toBe(5)
    const errorMessage = "hey"
    o = Err(errorMessage);
    expect(()=>o.unwrap()).toThrow(errorMessage)
    expect(o.unwrap_or_else((msg) => msg.length)).toBe(errorMessage.length)
    expect(o.unwrap_or(10)).toBe(10)
    expect(
        o.match({
            Ok: (num) => num,
            Err: () => 7
        })
    ).toBe(7)
});
test('Option', () => {
    const msg = "Hello World"
    let o: Option<string> = Some(msg)
    expect(o.unwrap()).toBe(msg);
    expect(o.unwrap_or_else(() => '!!')).toBe(msg)
    expect(o.unwrap_or('Yo')).toBe(msg)
    expect(
        o.match({
            Some: (msg) => msg.length,
            None: () => 18
        })
    ).toBe(msg.length)
    o = None
    expect(()=>o.unwrap()).toThrow()
    expect(o.unwrap_or_else(() => 'ohh')).toBe('ohh')
    expect(o.unwrap_or('yay')).toBe('yay')
    expect(
        o.match({
            Some: (msg) => msg.length,
            None: () => 18
        })
    ).toBe(18)
});

