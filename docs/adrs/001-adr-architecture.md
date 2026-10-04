---
id: ADR-001
version: 1.0.0
title: Base architecture of testing lib
status: accepted
date: 2026-10-04
authors:
  - Robert Willemelis
tags: [architecture]
---
## Context

The testing module provides testing commands.

## References

- 👉 [ADR-002: Spys](002-adr-spys.md) - spy functions
- 👉 [ADR-003: Mocks](003-adr-mocks.md) - mock functions

## Decisions

- format and utils are helper function
- all functions to be exported are in the index.ts

### Naming

- RAW - raw data from curl command
- HTTP - http data from curl command (header)

```typescript
{
  status: 200,
  statusMessage: "OK",
  ...
}
```

- CurlItem - object with all data from curl command (raw, http, response)

```typescript
{
  header: {
    status: 200,
    statusMessage: "OK",
    ...
  },
  status: 200,
  content: "foobar",
}
```
