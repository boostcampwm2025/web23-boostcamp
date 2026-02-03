#!/bin/bash
BASE_URL="http://localhost:3000"
USER_ID="1"

echo "=== 1. 자기소개서 생성 (질문 2개) ==="
CREATE_RES=$(curl -s -X POST "$BASE_URL/document/cover-letter/create" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'"$USER_ID"'",
    "title": "Initial Cover Letter",
    "content": [
      {"question": "Q1", "answer": "A1"},
      {"question": "Q2", "answer": "A2"}
    ]
  }')
echo "Create Response: $CREATE_RES"
DOC_ID=$(echo $CREATE_RES | grep -o '"documentId":"[^"]*"' | cut -d'"' -f4)
echo "Document ID: $DOC_ID"

echo -e "\n=== 2. 데이터베이스 확인 (Q1, Q2 존재 여부) ==="
# 이 부분은 직접 DB 쿼리가 불가능하므로, API 조회로 대체하거나 로그 확인이 필요하지만
# 여기서는 수정 후 조회로 간접 확인합니다.
GET_RES_1=$(curl -s -X GET "$BASE_URL/document/$DOC_ID/cover-letter?userId=$USER_ID")
echo "Before Update: $GET_RES_1"

echo -e "\n=== 3. 자기소개서 수정 (질문 1개로 변경: Q3) ==="
# Q1, Q2를 제거하고 Q3 하나만 보냄 -> Q1, Q2가 DB에서 삭제되어야 함
UPDATE_RES=$(curl -s -X PUT "$BASE_URL/document/$DOC_ID/cover-letter" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'"$USER_ID"'",
    "title": "Updated Cover Letter",
    "content": [
      {"question": "Q3", "answer": "A3"}
    ]
  }')
echo "Update Response: $UPDATE_RES"

echo -e "\n=== 4. 수정 후 조회 (Q1, Q2가 없고 Q3만 있어야 함) ==="
GET_RES_2=$(curl -s -X GET "$BASE_URL/document/$DOC_ID/cover-letter?userId=$USER_ID")
echo "After Update: $GET_RES_2"

# 5. 검증: 응답에 Q1, Q2가 없어야 함
if [[ "$GET_RES_2" != *"Q1"* ]] && [[ "$GET_RES_2" != *"Q2"* ]] && [[ "$GET_RES_2" == *"Q3"* ]]; then
  echo -e "\n✅ SUCCESS: Orphaned rows (Q1, Q2) removed successfully."
else
  echo -e "\n❌ FAILURE: Orphaned rows might remain or update failed."
fi
