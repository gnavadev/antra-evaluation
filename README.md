# Todo List

A dynamic todo list built with vanilla JavaScript, HTML, and CSS. It reads from
the [DummyJSON todos API](https://dummyjson.com/docs/todos) and keeps a local
state model as the source of truth, since DummyJSON is a mock API that does not
persist changes.

## Features

- Two lists: **Pending** and **Completed**, with items moving between them on toggle
- Add, edit (inline), toggle, and delete tasks
- All four CRUD endpoints wired up (`GET`, `POST`, `PUT`, `DELETE`)
- Event delegation on the list containers
- `localStorage` persistence across page refreshes

## Running it

ES modules and `fetch` require an HTTP origin, so open the app through a local
server rather than the `file://` protocol:

```bash
npx serve .
# or
python3 -m http.server
```

Then visit the printed URL.

## Architecture

Each module has a single responsibility, and dependencies are injected at the
composition root (`src/main.js`) so no module reaches for a concrete
implementation of another.

| Module | Responsibility |
| --- | --- |
| `config.js` | Constants (endpoints, storage key, limits) |
| `httpClient.js` | Generic `fetch` wrapper with a typed `HttpError` |
| `storage.js` | `localStorage` adapter behind a small interface |
| `todoApi.js` | Todo resource calls, built on the HTTP client |
| `todoStore.js` | In-memory state, persistence, and subscriptions |
| `todoView.js` | DOM rendering and delegated event handling |
| `todoController.js` | Orchestrates API calls and local state |
| `main.js` | Wires everything together |

Data flows one direction: the view emits user intents to the controller, the
controller updates the store, and the store notifies the view to re-render.

## A note on local vs. synced tasks

DummyJSON returns id `151` for every newly added task and 404s on requests to
ids it never issued. Tasks fetched from the server are marked `synced` and are
updated/deleted through the API; tasks added in the browser are kept local and
update state directly, which keeps the app correct without firing requests that
are guaranteed to fail.
