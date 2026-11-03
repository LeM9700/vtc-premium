/**
 * Construit une réponse HTTP en streaming Server-Sent Events.
 * `producer` reçoit un `send()` qu'il peut appeler autant de fois que
 * nécessaire ; le flux se ferme automatiquement quand `producer` se termine.
 */
export function createSSEStream(
  producer: (send: (data: unknown) => void) => Promise<void>
): Response {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false
      const send = (data: unknown) => {
        if (closed) return
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      try {
        await producer(send)
      } finally {
        closed = true
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
