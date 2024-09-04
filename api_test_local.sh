#! /bin/bash

curl -X POST http://localhost:8787 \
-H "Authorization: Bearer test-token" \
-H "Content-Type: application/json" \
-d '{"cgen": "yes", "ai": "llm", "cgenmessage": "This works!"}'
echo ""

curl -X POST http://localhost:8787 \
-H "Authorization: Bearer test-token" \
-H "Content-Type: application/json" \
-d '{"cgen": "no", "ai": "llm", "cgenmessage": "This works!"}'
echo ""
