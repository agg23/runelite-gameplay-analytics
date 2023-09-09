## Yank

Yank requires a no arg constructor (and thus can't have final values), and
setters for each property. It can silently fail without them.

Additionally, it appears to only allow deserialization into classes, so you
can't use primitive numbers.

```
@Data
@NoArgsConstructor
```