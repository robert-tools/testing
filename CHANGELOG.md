# Changelog

## 1.1.3

### 🐛 Bugfixes

- entry point for types from typings.d.ts. to index.d.ts

## 1.1.2

### 🐛 Bugfixes

- allow content to be set for forwarded items

## 1.1.1

### 🐛 Bugfixes

- pass through forward ITEMS and get correct http status

## 1.1.0

### ⚙️ chore

- restructure to folders
- rename config and typings file
- externalize some functions and types to global libs

### 🗃️ API changes

- add `_head`, `_header`, `_headerItem`, `_http`, `_httpItem`, `_raw`, `_response`
  to the public API
- change parameter of `spyOnURLs` to auto-generate necessary config

## 1.0.1

### 🐛 Bugfixes

- fix task templates
- fix .github folder

### ⚙️ chore

- add docs
- add CHANGELOG.md
- add markdown lint
- add missing npm tasks

## 1.0.0

### 🗃️ API changes

- add `spyOnCommand`
- add `spyOnURLs`
