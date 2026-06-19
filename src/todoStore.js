import { STORAGE_KEY } from "./config.js";

export function createTodoStore(storage) {
  let todos = readInitialState();
  const listeners = new Set();

  function readInitialState() {
    const stored = storage.load(STORAGE_KEY);
    return Array.isArray(stored) ? stored : [];
  }

  function snapshot() {
    return todos.map((todo) => ({ ...todo }));
  }

  function commit(nextTodos) {
    todos = nextTodos;
    storage.save(STORAGE_KEY, todos);
    listeners.forEach((listener) => listener(snapshot()));
  }

  function getTodos() {
    return snapshot();
  }

  function getTodo(id) {
    const found = todos.find((todo) => todo.id === id);
    return found ? { ...found } : null;
  }

  function setTodos(nextTodos) {
    commit(nextTodos.map((todo) => ({ ...todo })));
  }

  function addTodo(todo) {
    commit([{ ...todo }, ...todos]);
  }

  function updateTodo(id, changes) {
    commit(todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo)));
  }

  function removeTodo(id) {
    commit(todos.filter((todo) => todo.id !== id));
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(snapshot());
    return () => listeners.delete(listener);
  }

  return { getTodos, getTodo, setTodos, addTodo, updateTodo, removeTodo, subscribe };
}
