const ACTION = {
  TOGGLE: "toggle",
  EDIT: "edit",
  SAVE: "save",
  CANCEL: "cancel",
  DELETE: "delete",
};

const STATUS_TIMEOUT_MS = 4000;

export function createTodoView() {
  const form = document.querySelector("[data-todo-form]");
  const input = document.querySelector("[data-todo-input]");
  const status = document.querySelector("[data-status]");
  const pendingList = document.querySelector("[data-pending-list]");
  const completedList = document.querySelector("[data-completed-list]");

  const editingIds = new Set();
  let renderedTodos = [];
  let pendingFocusId = null;
  let statusTimeoutId = null;

  const handlers = {
    add: async () => false,
    toggle: () => {},
    save: () => {},
    delete: () => {},
  };

  form.addEventListener("submit", onFormSubmit);
  pendingList.addEventListener("click", onListClick);
  completedList.addEventListener("click", onListClick);
  pendingList.addEventListener("keydown", onListKeydown);
  completedList.addEventListener("keydown", onListKeydown);

  async function onFormSubmit(event) {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) return;

    const wasAdded = await handlers.add(title);
    if (wasAdded) {
      input.value = "";
      input.focus();
    }
  }

  function onListClick(event) {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;

    const item = trigger.closest("[data-id]");
    if (!item) return;

    dispatchAction(trigger.dataset.action, Number(item.dataset.id), item);
  }

  function onListKeydown(event) {
    if (!event.target.matches("[data-todo-edit-input]")) return;

    const item = event.target.closest("[data-id]");
    if (!item) return;

    const id = Number(item.dataset.id);
    if (event.key === "Enter") {
      event.preventDefault();
      commitEdit(id, item);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit(id);
    }
  }

  function dispatchAction(action, id, item) {
    if (action === ACTION.TOGGLE) handlers.toggle(id);
    else if (action === ACTION.DELETE) handlers.delete(id);
    else if (action === ACTION.EDIT) startEdit(id);
    else if (action === ACTION.SAVE) commitEdit(id, item);
    else if (action === ACTION.CANCEL) cancelEdit(id);
  }

  function startEdit(id) {
    editingIds.add(id);
    pendingFocusId = id;
    rerender();
  }

  function cancelEdit(id) {
    editingIds.delete(id);
    rerender();
  }

  function commitEdit(id, item) {
    const field = item.querySelector("[data-todo-edit-input]");
    const title = field ? field.value.trim() : "";

    if (!title) {
      cancelEdit(id);
      return;
    }

    editingIds.delete(id);
    handlers.save(id, title);
  }

  function render(todos) {
    renderedTodos = todos;
    const pending = todos.filter((todo) => !todo.completed);
    const completed = todos.filter((todo) => todo.completed);

    renderList(pendingList, pending, "Nothing pending. Add a task above.");
    renderList(completedList, completed, "No completed tasks yet.");
    restorePendingFocus();
  }

  function rerender() {
    render(renderedTodos);
  }

  function renderList(container, todos, emptyMessage) {
    container.replaceChildren();

    if (todos.length === 0) {
      container.append(createEmptyMessage(emptyMessage));
      return;
    }

    const fragment = document.createDocumentFragment();
    todos.forEach((todo) => fragment.append(createTodoItem(todo)));
    container.append(fragment);
  }

  function createTodoItem(todo) {
    const isEditing = editingIds.has(todo.id);
    const item = document.createElement("li");
    item.className = "todo-item";
    item.dataset.id = String(todo.id);
    item.append(
      isEditing ? createEditField(todo) : createTitle(todo),
      createActions(todo, isEditing),
    );
    return item;
  }

  function createTitle(todo) {
    const title = document.createElement("span");
    title.className = todo.completed ? "todo-title todo-title--done" : "todo-title";
    title.textContent = todo.todo;
    return title;
  }

  function createEditField(todo) {
    const field = document.createElement("input");
    field.type = "text";
    field.className = "todo-edit-input";
    field.value = todo.todo;
    field.setAttribute("data-todo-edit-input", "");
    field.setAttribute("aria-label", "Edit task");
    return field;
  }

  function createActions(todo, isEditing) {
    const actions = document.createElement("div");
    actions.className = "todo-actions";

    if (isEditing) {
      actions.append(
        createButton(ACTION.SAVE, "Save", "btn btn--primary"),
        createButton(ACTION.CANCEL, "Cancel", "btn btn--ghost"),
      );
      return actions;
    }

    actions.append(
      createToggleButton(todo),
      createButton(ACTION.EDIT, "Edit", "btn btn--ghost"),
      createButton(ACTION.DELETE, "Delete", "btn btn--danger"),
    );
    return actions;
  }

  function createToggleButton(todo) {
    const label = todo.completed ? "Move to pending" : "Mark complete";
    const symbol = todo.completed ? "\u21A9" : "\u2713";
    const button = createButton(ACTION.TOGGLE, symbol, "btn btn--toggle");
    button.setAttribute("aria-label", label);
    button.title = label;
    return button;
  }

  function createButton(action, text, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.action = action;
    button.textContent = text;
    return button;
  }

  function createEmptyMessage(message) {
    const item = document.createElement("li");
    item.className = "todo-empty";
    item.textContent = message;
    return item;
  }

  function restorePendingFocus() {
    if (pendingFocusId === null) return;

    const field = document.querySelector(`[data-id="${pendingFocusId}"] [data-todo-edit-input]`);
    pendingFocusId = null;
    if (!field) return;

    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  }

  function showError(message) {
    status.textContent = message;
    status.hidden = false;

    if (statusTimeoutId) clearTimeout(statusTimeoutId);
    statusTimeoutId = setTimeout(() => {
      status.hidden = true;
      status.textContent = "";
    }, STATUS_TIMEOUT_MS);
  }

  return {
    render,
    showError,
    bindAddTodo(handler) {
      handlers.add = handler;
    },
    bindToggleTodo(handler) {
      handlers.toggle = handler;
    },
    bindSaveTodo(handler) {
      handlers.save = handler;
    },
    bindDeleteTodo(handler) {
      handlers.delete = handler;
    },
  };
}
