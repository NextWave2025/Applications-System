#!/bin/bash
echo "=== Testing Backend Health ==="
curl -s https://nextwaveadmission.replit.app/api/health | jq .

echo -e "\n=== Testing Login ==="
curl -X POST https://nextwaveadmission.replit.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@gmail.com","password":"your-password"}' \
  -c test_cookies.txt \
  -w "Status: %{http_code}\n" \
  -s | jq .

echo -e "\n=== Testing Protected Route ==="
curl -X GET https://nextwaveadmission.replit.app/api/programs \
  -b test_cookies.txt \
  -w "Status: %{http_code}\n" \
  -s | jq .

rm -f test_cookies.txt
