#! /bin/bash

url=$1

curl -X POST $url \
-H "Authorization: Bearer test-token" \
-H "Content-Type: application/json" \
-d '{"cgen": "yes", "ai": "llm", "cgenmessage": "This works!"}'
echo ""
