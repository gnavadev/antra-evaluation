import { API_BASE_URL } from "./config.js";
import { createHttpClient } from "./httpClient.js";
import { createLocalStorageAdapter } from "./storage.js";
import { createTodoApi } from "./todoApi.js";
import { createTodoStore } from "./todoStore.js";
import { createTodoView } from "./todoView.js";
import { createTodoController } from "./todoController.js";

function bootstrap() {
  const httpClient = createHttpClient(API_BASE_URL);
  const storage = createLocalStorageAdapter();

  const api = createTodoApi(httpClient);
  const store = createTodoStore(storage);
  const view = createTodoView();

  const controller = createTodoController({
    api,
    store,
    onError: view.showError,
  });

  view.bindAddTodo(controller.addTodo);
  view.bindToggleTodo(controller.toggleTodo);
  view.bindSaveTodo(controller.saveTodo);
  view.bindDeleteTodo(controller.deleteTodo);

  store.subscribe(view.render);

  controller.init().catch(() => {
    view.showError("Couldn't load tasks from the server.");
  });
}

document.addEventListener("DOMContentLoaded", bootstrap);
