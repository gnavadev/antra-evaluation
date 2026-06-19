export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new HttpError(response.status, `Request to ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export function createHttpClient(baseUrl) {
  function resolve(path) {
    return `${baseUrl}${path}`;
  }

  return {
    get(path) {
      return request(resolve(path));
    },
    post(path, body) {
      return request(resolve(path), { method: "POST", body: JSON.stringify(body) });
    },
    put(path, body) {
      return request(resolve(path), { method: "PUT", body: JSON.stringify(body) });
    },
    delete(path) {
      return request(resolve(path), { method: "DELETE" });
    },
  };
}
