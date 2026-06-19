import { TODOS_ENDPOINT, INITIAL_FETCH_LIMIT, DEFAULT_USER_ID } from "./config.js";

export function createTodoApi(httpClient) {
  return {
    async fetchTodos() {
      const data = await httpClient.get(`${TODOS_ENDPOINT}?limit=${INITIAL_FETCH_LIMIT}`);
      return data.todos;
    },

    createTodo(title) {
      return httpClient.post(`${TODOS_ENDPOINT}/add`, {
        todo: title,
        completed: false,
        userId: DEFAULT_USER_ID,
      });
    },

    updateTodo(id, changes) {
      return httpClient.put(`${TODOS_ENDPOINT}/${id}`, changes);
    },

    deleteTodo(id) {
      return httpClient.delete(`${TODOS_ENDPOINT}/${id}`);
    },
  };
}
