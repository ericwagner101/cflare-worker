const EXPECTED_TOKEN = "test-token";
const queue: string[] = [];

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // Extract the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized: No token provided', { status: 401 });
    }

    const token = authHeader.split(' ')[1]; // Assuming the header is in the format "Bearer <token>"

    // Authenticate the token
    if (token !== EXPECTED_TOKEN) {
      return new Response('Unauthorized: Invalid token', { status: 401 });
    }

    // Parse the JSON payload
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response('Bad Request: Invalid JSON', { status: 400 });
    }

    // Check for the required key-value pairs
    if (payload.cgen === 'yes' && payload.ai === 'llm') {
      // Enqueue the message
      queue.push(payload.cgenmessage);

      // Dequeue the message
      const dequeuedMessage = queue.shift();
      if (dequeuedMessage) {
        return new Response(dequeuedMessage, { status: 200 });
      } else {
        return new Response('Queue is empty', { status: 200 });
      }
    } else {
      return new Response('Invalid payload', { status: 400 });
    }
  }
};