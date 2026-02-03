#!/bin/bash

# Document API Test Script
# This script tests all portfolio and cover letter APIs

echo "======================================"
echo "Document API Test - Starting"
echo "======================================"
echo ""

BASE_URL="http://localhost:8000/document"

# Test 1: Create Portfolio
echo "[TEST 1] POST /document/portfolio/create - Create Portfolio"
PORTFOLIO_RESPONSE=$(curl -s -X POST "$BASE_URL/portfolio/create" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Portfolio Title",
    "content": "This is test portfolio content with detailed information about my project."
  }')
echo "Response: $PORTFOLIO_RESPONSE"
PORTFOLIO_ID=$(echo $PORTFOLIO_RESPONSE | grep -o '"documentId":"[^"]*' | cut -d'"' -f4)
echo "Created Portfolio ID: $PORTFOLIO_ID"
echo ""

# Test 2: View Portfolio
echo "[TEST 2] GET /document/:documentId/portfolio - View Portfolio"
curl -s -X GET "$BASE_URL/$PORTFOLIO_ID/portfolio" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 2-1: Update Portfolio
echo "[TEST 2-1] PATCH /document/:documentId/portfolio - Update Portfolio"
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/$PORTFOLIO_ID/portfolio" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Portfolio Title",
    "content": "Updated content with new information."
  }')
echo "Response: $UPDATE_RESPONSE"
echo ""

# Test 2-2: View Updated Portfolio
echo "[TEST 2-2] GET /document/:documentId/portfolio - View Updated Portfolio"
curl -s -X GET "$BASE_URL/$PORTFOLIO_ID/portfolio" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 3: Create Cover Letter
echo "[TEST 3] POST /document/cover-letter/create - Create Cover Letter"
COVER_LETTER_RESPONSE=$(curl -s -X POST "$BASE_URL/cover-letter/create" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Cover Letter Title",
    "content": [
      {
        "question": "지원 동기를 작성해주세요",
        "answer": "저는 귀사의 비전에 공감하여 지원하게 되었습니다."
      },
      {
        "question": "자신의 강점을 설명해주세요",
        "answer": "문제 해결 능력과 팀워크가 저의 강점입니다."
      }
    ]
  }')
echo "Response: $COVER_LETTER_RESPONSE"
COVER_LETTER_ID=$(echo $COVER_LETTER_RESPONSE | grep -o '"documentId":"[^"]*' | cut -d'"' -f4)
echo "Created Cover Letter ID: $COVER_LETTER_ID"
echo ""

# Test 3-1: Update Cover Letter
echo "[TEST 3-1] PUT /document/:documentId/cover-letter - Update Cover Letter"
UPDATE_CL_RESPONSE=$(curl -s -X PUT "$BASE_URL/$COVER_LETTER_ID/cover-letter" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Cover Letter Title",
    "content": [
      {
        "question": "지원 동기 (수정)",
        "answer": "수정된 지원 동기입니다."
      },
      {
        "question": "성격의 장단점 (수정)",
        "answer": "수정된 성격의 장단점입니다."
      }
    ]
  }')
echo "Response: $UPDATE_CL_RESPONSE"
echo ""

# Test 3-2: View Updated Cover Letter
echo "[TEST 3-2] GET /document/:documentId/cover-letter - View Updated Cover Letter"
curl -s -X GET "$BASE_URL/$COVER_LETTER_ID/cover-letter" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 4: Get Document List (All)
echo "[TEST 4] GET /document?page=1&take=10 - Get All Documents"
curl -s -X GET "$BASE_URL?page=1&take=10" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 5: Get Document List (Portfolio Only)
echo "[TEST 5] GET /document?page=1&take=10&type=PORTFOLIO - Get Portfolio Documents"
curl -s -X GET "$BASE_URL?page=1&take=10&type=PORTFOLIO" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 6: Get Document List (Cover Letter Only)
echo "[TEST 6] GET /document?page=1&take=10&type=COVER - Get Cover Letter Documents"
curl -s -X GET "$BASE_URL?page=1&take=10&type=COVER" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 7: Get Document List (Sorted by Created Date DESC)
echo "[TEST 7] GET /document?page=1&take=10&sort=DESC - Get Documents Sorted DESC"
curl -s -X GET "$BASE_URL?page=1&take=10&sort=DESC" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 8: Get Document List (Sorted by Created Date ASC)
echo "[TEST 8] GET /document?page=1&take=10&sort=ASC - Get Documents Sorted ASC"
curl -s -X GET "$BASE_URL?page=1&take=10&sort=ASC" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 9: Delete Cover Letter
echo "[TEST 9] DELETE /document/:documentId/cover-letter - Delete Cover Letter"
DELETE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/$COVER_LETTER_ID/cover-letter" \
  -H "Content-Type: application/json")
echo "Response: $DELETE_RESPONSE"
echo ""

# Test 10: Verify Deletion - Try to retrieve deleted cover letter
echo "[TEST 10] GET /document?page=1&take=10&type=COVER - Verify Cover Letter Deletion"
curl -s -X GET "$BASE_URL?page=1&take=10&type=COVER" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 11: Error Case - Get Non-existent Portfolio
echo "[TEST 11] GET /document/999999/portfolio - Error Case: Non-existent Portfolio"
curl -s -X GET "$BASE_URL/999999/portfolio" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 12: Error Case - Delete Non-existent Cover Letter
echo "[TEST 12] DELETE /document/999999/cover-letter - Error Case: Delete Non-existent Cover Letter"
DELETE_ERROR_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/999999/cover-letter" \
  -H "Content-Type: application/json")
echo "Response: $DELETE_ERROR_RESPONSE"
echo ""

echo "======================================"
echo "Document API Test - Completed"
echo "======================================"
