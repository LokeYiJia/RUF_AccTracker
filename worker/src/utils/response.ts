export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  })
}

export function text(message: string, status = 200) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
  })
}
