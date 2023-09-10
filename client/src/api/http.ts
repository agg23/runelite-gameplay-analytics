export const get = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
  });

  if (response.status !== 200 || !response.body) {
    throw new Error(`Failed to GET ${url} with status code ${response.status}`);
  }

  return response.json();
};

export const post = async <TRequest, TResponse>(
  url: string,
  request: TRequest
): Promise<TResponse> => {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (response.status !== 200 || !response.body) {
    throw new Error(
      `Failed to POST ${url} with status code ${response.status}`
    );
  }

  return response.json();
};
