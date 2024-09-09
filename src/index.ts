import { MessageStore } from './MessageStore';
import { DurableObjectNamespace, ExportedHandler } from '@cloudflare/workers-types';

export { MessageStore };

const EXPECTED_TOKEN = "test-token";
import postgres from 'postgres';

// Random time delay function
function waitRandomTime(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

async function randomTimeWait() {
  await waitRandomTime(15000, 30000); // Wait between 15 and 30 seconds
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized: No token provided', { status: 401 });
    }

    const token = authHeader.split(' ')[1]; // Assuming the header is in the format "Bearer <token>"
    if (token !== EXPECTED_TOKEN) {
      return new Response('Unauthorized: Invalid token', { status: 401 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response('Bad Request: Invalid JSON', { status: 400 });
    }

    if (payload.cgen === 'yes' && payload.ai === 'llm') {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          function sendStatus(status: string) {
            controller.enqueue(encoder.encode(`data: ${status}\n\n`));
          }

          sendStatus('Processing started');

          // Interact with the Durable Object
          const id = env.MESSAGE_STORE.idFromName('message-store');
          const obj = env.MESSAGE_STORE.get(id);
          const baseUrl = `https://${env.MESSAGE_STORE.idFromName('message-store').toString()}.workers.dev`;

          await obj.fetch(new Request(`${baseUrl}/add`, {
            method: 'POST',
            body: JSON.stringify(payload.cgenmessage)
          }));
          sendStatus('Message stored in Durable Object');

          // Enqueue the message to the Cloudflare queue
          await env.queue.send(payload.cgenmessage);

          // Simulate processing delay
          await randomTimeWait();
          sendStatus('Processing finished');

          // Retrieve message from Durable Object
          const response = await obj.fetch(`${baseUrl}/get`);
          const messages = await response.json();
          sendStatus(`Retrieved from Durable Object: ${JSON.stringify(messages)}`);

          // Write to the database
          const sql = postgres(env.HYPERDRIVE.connectionString);
          try {
            const result = await sql`INSERT INTO messages (messages) VALUES (${JSON.stringify(messages)})`;
            sendStatus('Message written to database');
          } catch (e) {
            sendStatus(`Error: ${e.message}`);
          }

          controller.close();
        }
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" }
      });
    } else {
      return new Response('Invalid payload', { status: 400 });
    }
  },

  async queue(batch, env): Promise<void> {
    let messages = JSON.stringify(batch.messages);
  }
} satisfies ExportedHandler<Env>;

// Interface for the environment object
export interface Env {
  MESSAGE_STORE: DurableObjectNamespace;
  HYPERDRIVE: Hyperdrive;
  queue: Queue<any>; // Cloudflare queue
}

// Define the Queue and Hyperdrive types
interface Queue<T> {
  send(message: T): Promise<void>;
  pop(): Promise<T[]>; // Use pop() instead of get()
}

interface Hyperdrive {
  connectionString: string;
}