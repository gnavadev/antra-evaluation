import { DEFAULT_USER_ID } from "./config.js";

export function createTodoController({ api, store, onError }) {
  async function init() {
    if (store.getTodos().length > 0) return;

    const todos = await api.fetchTodos();
    store.setTodos(todos.map((todo) => ({ ...todo, synced: true })));
  }

  async function addTodo(title) {
    const text = title.trim();
    if (!text) return false;

    try {
      await api.createTodo(text);
    } catch {
      onError("Couldn't add the task. Please try again.");
      return false;
    }

    store.addTodo(buildLocalTodo(text));
    return true;
  }

  async function toggleTodo(id) {
    const todo = store.getTodo(id);
    if (!todo) return;

    const changes = { completed: !todo.completed };
    if (await syncToServer(todo, changes, "Couldn't update the task status.")) {
      store.updateTodo(id, changes);
    }
  }

  async function saveTodo(id, title) {
    const text = title.trim();
    if (!text) return;

    const todo = store.getTodo(id);
    if (!todo) return;

    const changes = { todo: text };
    if (await syncToServer(todo, changes, "Couldn't save your changes.")) {
      store.updateTodo(id, changes);
    }
  }

  async function deleteTodo(id) {
    const todo = store.getTodo(id);
    if (!todo) return;

    if (todo.synced) {
      try {
        await api.deleteTodo(id);
      } catch {
        onError("Couldn't delete the task.");
        return;
      }
    }

    store.removeTodo(id);
  }

  async function syncToServer(todo, changes, errorMessage) {
    if (!todo.synced) return true;

    try {
      await api.updateTodo(todo.id, changes);
      return true;
    } catch {
      onError(errorMessage);
      return false;
    }
  }

  function buildLocalTodo(text) {
    return {
      id: nextLocalId(),
      todo: text,
      completed: false,
      userId: DEFAULT_USER_ID,
      synced: false,
    };
  }

  function nextLocalId() {
    const ids = store.getTodos().map((todo) => todo.id);
    const highest = ids.length > 0 ? Math.max(...ids) : 0;
    return highest + 1;
  }

  return { init, addTodo, toggleTodo, saveTodo, deleteTodo };
}
