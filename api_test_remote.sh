#! /bin/bash

curl -X POST https://cflare-worker.eric-04e.workers.dev/ \
-H "Authorization: Bearer test-token" \
-H "Content-Type: application/json" \
-d '{"cgen": "yes", "ai": "llm", "cgenmessage": "This works!"}'
echo ""
