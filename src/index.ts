const EXPECTED_TOKEN = "test-token";

// Random time delay function
function waitRandomTime(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}
async function randomTimeWait() {
  await waitRandomTime(15000, 30000); // Wait between 15 and 30 seconds
}

export default {
  // Fetch handler for incoming requests
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
      // Enqueue the message to the Cloudflare queue
      await env.queue.send(payload.cgenmessage);
      return new Response('Added to queue', {status: 200});
    } else {
      return new Response('Invalid payload', {status: 400});
    }
  },
  // Queue handler for processing messages from the queue
  async queue(batch, env): Promise<void> {
    await randomTimeWait(); // This will 15 and 30 seconds (the message will already be popped from the queue)
    let messages = JSON.stringify(batch.messages);
    console.log(`Consumed from queue: ${messages}`);
  }
} satisfies ExportedHandler<Env>;

// Interface for the environment object
export interface Env {
   queue: Queue<any>; // Cloudflare queue
}