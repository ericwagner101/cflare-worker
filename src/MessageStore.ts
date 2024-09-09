// MessageStore.ts
export class MessageStore {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/add') {
      const message = await request.json();
      await this.state.storage.put('message', message);
      return new Response('Message stored');
    } else if (url.pathname === '/get') {
      const message = await this.state.storage.get('message');
      return new Response(JSON.stringify(message));
    } else {
      return new Response('Not found', { status: 404 });
    }
  }
}