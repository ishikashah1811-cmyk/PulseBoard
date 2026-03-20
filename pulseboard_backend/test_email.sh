#!/bin/bash
curl -X POST http://localhost:8082/api/email/inbound \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "sender=aeshvarya31awasthi@gmail.com" \
  --data-urlencode "subject=Hackathon Night Final Ceremony" \
  --data-urlencode "body-plain=Join us on March 10th at 7 PM in LT-1 for the closing ceremony. Prizes will be announced!"
