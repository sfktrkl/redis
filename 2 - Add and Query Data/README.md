## Documentation of commands

https://redis.io/commands/

```
SET key value                       # Capitalized, keywords
[NX | XX]                           # Square brackets, optional
[GET]
[
    EX seconds |
    PX milliseconds |
    EXAT unix-time-seconds |
    PXAT unix-time-milliseconds |
    KEEPTTL
]
```
