---
id: ADR-001
version: 1.0.0
title: Base architecture of spy functions
status: accepted
date: 2026-10-04
authors:
  - Robert Willemelis
tags: [architecture]
---
## Context

The module provides easy to use spy functions

## Decisions

- spyOnCommand: each request with command() returns the same result
- spyOnURLs: each request with a specific URL returns a different result

### spyOnURLs

- base input: `spyOnURLs(input: MOCK_CONFIG)`

#### forwarding urls

with forwarded urls:

```typescript
{
  "example.com": {
    "status": 200,
    "order": [
      "example.com",
      "www.example.com",
      "http://example.com",
      "https://example.com",
      "https://www.example.com",
      "https://www.example.com/"
    ]
  },
}
```

it creates the following config:

```typescript
{
  "example.com": "HTTP/1.1 301 Moved Permanently\n some response",
  "www.example.com": "HTTP/1.1 301 Moved Permanently\n some response",
  "http://example.com": "HTTP/1.1 301 Moved Permanently\n some response",
  "https://example.com": "HTTP/1.1 200 OK\n some response",
}
```

#### direct content urls

with direct content urls:

```typescript
{
  "example.com": {
    "status": 200,
    "content": "some response"
  },
}
```

it creates the following config:

```typescript
{
  "example.com": "HTTP/1.1 200 OK\n some response",
}
```

and it can also create a fallback or a non-http response for unknown domains:

