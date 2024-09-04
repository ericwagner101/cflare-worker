const EXPECTED_TOKEN = "test-token";
const queue: string[] = [];

function waitRandomTime(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Example usage:
async function randomTimeWait() {
  await waitRandomTime(15000, 30000); // Wait between 15 and 30 seconds
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    // Extract the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized: No token provided', {status: 401});
    }

    const token = authHeader.split(' ')[1]; // Assuming the header is in the format "Bearer <token>"

    // Authenticate the token
    if (token !== EXPECTED_TOKEN) {
      return new Response('Unauthorized: Invalid token', {status: 401});
    }

    // Parse the JSON payload
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response('Bad Request: Invalid JSON', {status: 400});
    }

    // Check for the required key-value pairs
    if (payload.cgen === 'yes' && payload.ai === 'llm') {
      // Enqueue the message
      await env.queue.send(payload.cgenmessage);
      return new Response('Added to queue', {status: 200});
    } else {
      return new Response('Invalid payload', {status: 400});
    }
  },
  async queue(batch, env): Promise<void> {
    await randomTimeWait();
    let messages = JSON.stringify(batch.messages);
    console.log(`Consumed from queue: ${messages}`);
  }
}satisfies ExportedHandler<Env>;

export interface Env {
   queue: Queue<any>;
}

