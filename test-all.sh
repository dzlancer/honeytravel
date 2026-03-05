#!/bin/bash

BASE="http://127.0.0.1:3001/api"
PASS=0
FAIL=0

check() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS  $name => $actual"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $name => $actual (expected $expected)"
    FAIL=$((FAIL + 1))
  fi
}

# === SETUP: Register a fresh user ===
echo "========== SETUP =========="
python -c "import json; print(json.dumps({'email':'testall@test.com','password':'TestAll1234!','firstName':'Test','lastName':'All'}))" > /tmp/reg.json
REG=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/register" -H "Content-Type: application/json" -d @/tmp/reg.json)
echo "  Register => $REG"

python -c "import json; print(json.dumps({'email':'testall@test.com','password':'TestAll1234!'}))" > /tmp/login.json
RESP=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d @/tmp/login.json)
TOKEN=$(python -c "import json; d=json.loads(r'''$RESP'''); print(d['accessToken'])")
REFRESH=$(python -c "import json; d=json.loads(r'''$RESP'''); print(d['refreshToken'])")
echo "  Login OK. Token: ${#TOKEN} chars"
echo ""

# === 1. AUTH (test refresh BEFORE any re-login to avoid token rotation) ===
echo "========== 1. AUTH =========="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/register" -H "Content-Type: application/json" -d @/tmp/reg.json)
check "POST /auth/register (duplicate)" "409" "$CODE"

# Test refresh FIRST (before any re-login invalidates the token)
# Use single curl call to capture BOTH body and status code (token rotation invalidates after first use)
printf '{"refreshToken":"%s"}' "$REFRESH" > /tmp/ref.json
REFRESH_RAW=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/refresh" -H "Content-Type: application/json" -d @/tmp/ref.json)
REFRESH_CODE=$(echo "$REFRESH_RAW" | tail -1)
REFRESH_RESP=$(echo "$REFRESH_RAW" | sed '$d')
# Update token from refresh response if successful
NEW_TOKEN=$(python -c "import json; d=json.loads(r'''$REFRESH_RESP'''); print(d.get('accessToken',''))" 2>/dev/null || echo "")
if [ -n "$NEW_TOKEN" ] && [ ${#NEW_TOKEN} -gt 50 ]; then
  TOKEN="$NEW_TOKEN"
fi
check "POST /auth/refresh" "200" "$REFRESH_CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d @/tmp/login.json)
check "POST /auth/login" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"wrong@test.com","password":"wrong"}')
check "POST /auth/login (wrong creds)" "401" "$CODE"
echo ""

# Refresh token for subsequent tests
RESP=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d @/tmp/login.json)
TOKEN=$(python -c "import json; d=json.loads(r'''$RESP'''); print(d['accessToken'])")

# === 2. USERS ===
echo "========== 2. USERS =========="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/users/me" -H "Authorization: Bearer $TOKEN")
check "GET /users/me" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/users/me" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"firstName":"Updated"}')
check "PUT /users/me" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/users/me")
check "GET /users/me (no auth)" "401" "$CODE"
echo ""

# === 3. SUPPLIERS ===
echo "========== 3. SUPPLIERS =========="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/suppliers/hotels/search?destination=algiers")
check "GET /suppliers/hotels/search" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/suppliers/hotels/search")
check "GET /suppliers/hotels/search (no params)" "200" "$CODE"
echo ""

# === 4. SEARCH (Elasticsearch) ===
echo "========== 4. SEARCH (ES) =========="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/search/hotels?q=hotel")
check "GET /search/hotels?q=hotel" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/search/hotels")
check "GET /search/hotels (no query)" "200" "$CODE"
echo ""

# === 5. BOOKINGS ===
echo "========== 5. BOOKINGS =========="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/bookings/my" -H "Authorization: Bearer $TOKEN")
check "GET /bookings/my" "200" "$CODE"

python -c "import json; print(json.dumps({'productType':'hotel','productId':'mock-1','supplierId':'mock-hotel','checkIn':'2026-04-01','checkOut':'2026-04-05','totalAmount':500,'currency':'USD','guestDetails':[{'firstName':'Test','lastName':'User','email':'test@test.com'}]}))" > /tmp/booking.json
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/bookings" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d @/tmp/booking.json)
check "POST /bookings (auto guestCount)" "201" "$CODE"

python -c "import json; print(json.dumps({'productType':'hotel','productId':'mock-1','supplierId':'mock-hotel','checkIn':'2026-05-01','checkOut':'2026-05-05','guestCount':2,'totalAmount':800,'currency':'USD','guestDetails':[{'firstName':'Test','lastName':'User','email':'t@t.com'},{'firstName':'G','lastName':'Two','email':'g@t.com'}]}))" > /tmp/booking2.json
BOOK_RESP=$(curl -s -X POST "$BASE/bookings" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d @/tmp/booking2.json)
BOOK_ID=$(python -c "import json; d=json.loads(r'''$BOOK_RESP'''); print(d.get('id','FAIL'))" 2>/dev/null || echo "FAIL")
CODE=$(python -c "import json; d=json.loads(r'''$BOOK_RESP'''); print('201' if 'id' in d else str(d.get('statusCode','?')))" 2>/dev/null || echo "?")
check "POST /bookings (with guestCount)" "201" "$CODE"

if [ "$BOOK_ID" != "FAIL" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/bookings/$BOOK_ID" -H "Authorization: Bearer $TOKEN")
  check "GET /bookings/:id" "200" "$CODE"

  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/bookings/$BOOK_ID/cancel" -H "Authorization: Bearer $TOKEN")
  check "PUT /bookings/:id/cancel" "200" "$CODE"
fi
echo ""

# === 6. LOYALTY ===
echo "========== 6. LOYALTY =========="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/loyalty/balance" -H "Authorization: Bearer $TOKEN")
check "GET /loyalty/balance" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/loyalty/history" -H "Authorization: Bearer $TOKEN")
check "GET /loyalty/history" "200" "$CODE"
echo ""

# === 7. MARKETING ===
echo "========== 7. MARKETING =========="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/marketing/promo/validate" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"code":"NONEXISTENT","bookingAmount":100}')
check "POST /marketing/promo/validate" "201" "$CODE"
echo ""

# === 8. ADMIN (expect 403 for non-admin user — this IS correct behavior) ===
echo "========== 8. ADMIN (role guard) =========="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/admin/dashboard" -H "Authorization: Bearer $TOKEN")
check "GET /admin/dashboard (403 = guarded)" "403" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/admin/users" -H "Authorization: Bearer $TOKEN")
check "GET /admin/users (403 = guarded)" "403" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/admin/promos" -H "Authorization: Bearer $TOKEN")
check "GET /admin/promos (403 = guarded)" "403" "$CODE"
echo ""

# === 9. CLEANUP ===
echo "========== 9. CLEANUP =========="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/logout" -H "Authorization: Bearer $TOKEN")
check "POST /auth/logout" "200" "$CODE"
echo ""

# === SUMMARY ===
echo "=========================================="
echo "  RESULTS: $PASS passed, $FAIL failed (out of $((PASS + FAIL)) tests)"
echo "=========================================="
