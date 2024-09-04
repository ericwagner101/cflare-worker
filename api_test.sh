#! /bin/bash

# Get the URL 
url=$1

# Check if the first argument (url) is empty
if [ -z "$url" ]; then
  echo "Error: URL is missing."
  echo "Usage: ./script.sh <url>"
  exit 1
fi

# Run the producer
curl -X POST $url \
-H "Authorization: Bearer test-token" \
-H "Content-Type: application/json" \
-d '{"cgen": "yes", "ai": "llm", "cgenmessage": "This works!"}'
echo ""
