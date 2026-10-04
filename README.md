# @robert.tools/testing

A set of helper for testing

## Installation

```bash
npm install @robert.tools/testing
```

## 📜 Usage

### 🟢 Installation

```bash
npm install @robert.tools/testing
```

### 📝 Sample usage

```typescript
import { spyOnCommand } from '@robert.tools/testing';

const spy = spyOnCommand('hello');
command('curl someurl') // 'result: hello\n'
```

## 🗃️ commands

After an npm install with `npm i` the following commands are available:

### 📦 Spy functions

* spy on command and return result: `spyOnCommand(result)`
* spy on URLs and return result: `spyOnURLs(input)`

### 📦 Mock functions

* header of HTTP response: `_header(domain, opts)`
* mock HTTP response from HTTP item: `_response(base, opts)`
* get HTTP item from domain and options: `_headerItem(url, alt, opts)`
* get HTTP item from status and items: `_http(status, alt)`
* get the header HTTP item from status and items: `_head(status, alt)`
* get the full CurlItem from url, alt and opts: `_httpItem(url, alt, opts)`
* get the raw data from Properties and config: `_raw(base, config)`

## ⚖️ Notes

This software is hand-crafted, test-driven and assisted by AI tools. I know each
line of my code. ✌️

| Tool | Comment |
| --- | --- |
| ![assisted by Jest](https://img.shields.io/badge/Jest-TDD-008800?logo=jest) | Test-driven development with Jest |
| ![assisted by robert.tools](https://img.shields.io/badge/robert.tools-ecosystem-008800) | Part of the robert.tools ecosystem |
| ![assisted by GitHub Copilot](https://img.shields.io/badge/GitHub_Copilot-assisted-8A2BE2?logo=githubcopilot) | Code completion |
| ![assisted by OpenAI](https://img.shields.io/badge/OpenAI-assisted-8A2BE2?logo=openai) | chatGPT research |
