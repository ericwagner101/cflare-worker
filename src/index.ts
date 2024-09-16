import { Hono } from 'hono';
import { MessageStore } from './MessageStore';
import { DurableObjectNamespace, ExportedHandler, Request as CfRequest, Headers as CfHeaders } from '@cloudflare/workers-types';
import postgres from 'postgres';

export { MessageStore };

const app = new Hono();

const EXPECTED_TOKEN = "test-token";

export interface Env {
  MESSAGE_STORE: DurableObjectNamespace;
  HYPERDRIVE: Hyperdrive;
  queue: Queue<any>; // Cloudflare queue
}

interface Queue<T> {
  send(message: T): Promise<void>;
  pop(): Promise<T[]>; // Use pop() instead of get()
}

interface Hyperdrive {
  connectionString: string;
}

// Extend the Headers type to include getSetCookie
interface ExtendedHeaders extends CfHeaders {
  getSetCookie?: () => string[];
}

// Random time delay function
function waitRandomTime(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

async function randomTimeWait() {
  await waitRandomTime(15000, 30000); // Wait between 15 and 30 seconds
}

// Middleware for authentication
app.use('*', async (c, next) => {
  console.log('Middleware hit');
  const authHeader = c.req.header('Authorization');
  console.log('Authorization Header:', authHeader); // Log the header for debugging

  if (!authHeader) {
    return c.text('Unauthorized: No token provided', 401);
  }

  const token = authHeader.split(' ')[1]; // Assuming the header is in the format "Bearer <token>"
  console.log('Authorization Token:', token); // Log the token for debugging

  if (token !== EXPECTED_TOKEN) {
    console.log('Invalid token:', token); // Log the invalid token
    return c.text('Unauthorized: Invalid token', 401);
  }

  await next();
  console.log('Middleware passed');
});

// Log the request path and method
app.use('*', async (c, next) => {
  console.log(`Request Path: ${c.req.path}`);
  console.log(`Request Method: ${c.req.method}`);
  await next();
});

app.post('/', async (c) => {
  console.log('POST route hit');
  let payload;
  try {
    payload = await c.req.json();
  } catch (e) {
    return c.text('Bad Request: Invalid JSON', 400);
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
        const id = (c.env as Env).MESSAGE_STORE.idFromName('message-store');
        const obj = (c.env as Env).MESSAGE_STORE.get(id);
        const baseUrl = `https://${id.toString()}.workers.dev`;

        await obj.fetch(new Request(`${baseUrl}/add`, {
          method: 'POST',
          body: JSON.stringify(payload.cgenmessage)
        } as RequestInit));
        sendStatus('Message stored in Durable Object');

        // Enqueue the message to the Cloudflare queue
        await (c.env as Env).queue.send(payload.cgenmessage);
        sendStatus('Message added to queue');

        // Simulate processing delay
        await randomTimeWait();
        sendStatus('Processing finished');

        // Retrieve message from Durable Object
        const response = await obj.fetch(new Request(`${baseUrl}/get` as RequestInfo));
        const messages = await response.json();
        sendStatus(`Retrieved from Durable Object: ${JSON.stringify(messages)}`);

        // Write to the database
        const sql = postgres((c.env as Env).HYPERDRIVE.connectionString);
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
    return c.text('Invalid payload', 400);
  }
});

app.post('/queue', async (c) => {
  console.log('POST /queue route hit');
  const reqBody = await c.req.json();
  let messages = JSON.stringify(reqBody.messages);
  console.log(`Popped from queue: ${messages}`);
  return c.text('Queue processed');
});

// Define the queue handler with type checking
async function queueHandler(batch: any[], env: Env) {
}

// Add this catch-all route at the end of your route definitions
app.all('*', (c) => {
  console.log(`Unmatched request - Path: ${c.req.path}, Method: ${c.req.method}`);
  return c.text('Not Found', 404);
});

// Register the queue handler
const handler: ExportedHandler<Env> = {
  fetch: app.fetch as unknown as ExportedHandlerFetchHandler<Env>,
  queue: queueHandler as unknown as ExportedHandlerQueueHandler<Env>
};

export default handler;