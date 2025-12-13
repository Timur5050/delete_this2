#!/bin/bash

# API Testing Script for Linux Process Viewer

BASE_URL="http://localhost:5000/api"

echo "════════════════════════════════════════════════════════"
echo "   Linux Process Viewer - API Testing Script"
echo "════════════════════════════════════════════════════════"
echo ""

# Test 1: Health Check
echo "✓ Test 1: Health Check"
echo "  URL: GET $BASE_URL/health"
curl -s "$BASE_URL/health" | jq '.'
echo ""
echo ""

# Test 2: Get all processes
echo "✓ Test 2: Get All Processes (count only)"
echo "  URL: GET $BASE_URL/processes"
PROCESS_COUNT=$(curl -s "$BASE_URL/processes" | jq 'length')
echo "  Total processes: $PROCESS_COUNT"
echo ""

# Test 3: Get first process
echo "✓ Test 3: Get First Process Details"
echo "  URL: GET $BASE_URL/processes"
curl -s "$BASE_URL/processes" | jq '.[0]'
echo ""
echo ""

# Test 4: Get specific process (PID 1)
echo "✓ Test 4: Get Process by PID (PID=1)"
echo "  URL: GET $BASE_URL/processes/1"
curl -s "$BASE_URL/processes/1" | jq '.'
echo ""
echo ""

# Test 5: Get system stats
echo "✓ Test 5: Get System Statistics"
echo "  URL: GET $BASE_URL/stats"
curl -s "$BASE_URL/stats" | jq '.' | head -20
echo ""
echo ""

# Test 6: Get snapshots (list)
echo "✓ Test 6: Get All Snapshots"
echo "  URL: GET $BASE_URL/snapshots"
curl -s "$BASE_URL/snapshots" | jq '.'
echo ""
echo ""

# Test 7: Create snapshot
echo "✓ Test 7: Create Process Snapshot"
echo "  URL: POST $BASE_URL/snapshots"
echo "  Payload: { name: 'Test Snapshot', description: 'Testing' }"
SNAPSHOT=$(curl -s -X POST "$BASE_URL/snapshots" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Snapshot",
    "description": "Created at '$(date)'"
  }')
echo "$SNAPSHOT" | jq '.'
SNAPSHOT_ID=$(echo "$SNAPSHOT" | jq '.id')
echo ""
echo ""

# Test 8: Get snapshot by ID (if created)
if [ "$SNAPSHOT_ID" != "null" ] && [ ! -z "$SNAPSHOT_ID" ]; then
  echo "✓ Test 8: Get Snapshot by ID (ID=$SNAPSHOT_ID)"
  echo "  URL: GET $BASE_URL/snapshots/$SNAPSHOT_ID"
  curl -s "$BASE_URL/snapshots/$SNAPSHOT_ID" | jq '{id: .id, name: .name, description: .description, created_at: .created_at}'
  echo ""
  echo ""
fi

# Test 9: Test error handling - invalid PID
echo "✓ Test 9: Error Handling - Invalid PID"
echo "  URL: GET $BASE_URL/processes/9999999"
curl -s "$BASE_URL/processes/9999999" | jq '.'
echo ""
echo ""

# Test 10: Test error handling - invalid process kill (no confirmation in script)
echo "✓ Test 10: Process Kill (would terminate - SKIPPED for safety)"
echo "  URL: POST $BASE_URL/processes/:pid/kill"
echo "  ⚠️  Skipped to prevent accidental termination"
echo "  Example: curl -X POST http://localhost:5000/api/processes/99999/kill"
echo ""
echo ""

echo "════════════════════════════════════════════════════════"
echo "   ✅ All API Tests Completed"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Frontend URL: http://localhost:3000"
echo "Backend API: http://localhost:5000/api"
echo ""
