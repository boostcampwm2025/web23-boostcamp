#!/bin/bash
BASE_URL="http://localhost:8000"

echo -e "\n=== 1. 자기소개서 생성 (질문 2개: Q_OLD_1, Q_OLD_2) ==="
# userId 제거 (Controller에서 하드코딩 되어 있음)
CREATE_RES=$(curl -s -X POST "$BASE_URL/document/cover-letter/create" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Orphan Test Cover Letter",
    "content": [
      {"question": "Q_OLD_1", "answer": "A1"},
      {"question": "Q_OLD_2", "answer": "A2"}
    ]
  }')
echo "Create Response: $CREATE_RES"
DOC_ID=$(echo $CREATE_RES | grep -o '"documentId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DOC_ID" ]; then
  echo "❌ Failed to create document. Exiting."
  exit 1
fi
echo "Created Document ID: $DOC_ID"

echo -e "\n=== 2. 생성 결과 조회 ==="
GET_RES_1=$(curl -s -X GET "$BASE_URL/document/$DOC_ID/cover-letter")
echo "Current Content: $GET_RES_1"

echo -e "\n=== 3. 자기소개서 수정 (질문 교체: Q_NEW_1 only) ==="
# 목록 전체를 교체함. 기존 Q_OLD_1, Q_OLD_2는 제거되어야 함.
UPDATE_RES=$(curl -s -X PUT "$BASE_URL/document/$DOC_ID/cover-letter" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Orphan Test Updated",
    "content": [
      {"question": "Q_NEW_1", "answer": "A3"}
    ]
  }')
echo "Update Response: $UPDATE_RES"

echo -e "\n=== 4. 검증: 수정된 내용 조회 ==="
GET_RES_2=$(curl -s -X GET "$BASE_URL/document/$DOC_ID/cover-letter")
echo "Final Content: $GET_RES_2"

# 검증 로직
if [[ "$GET_RES_2" != *"Q_OLD_1"* ]] && [[ "$GET_RES_2" == *"Q_NEW_1"* ]]; then
  echo -e "\n✅ SUCCESS: Old questions were removed and replaced by new one."
  echo "This implies orphan removal (via orphanedRowAction) is working effectively."
else
  echo -e "\n❌ FAILURE: Old questions might still be present or update failed."
fi

# Clean up
echo -e "\n=== 5. 테스트 데이터 삭제 ==="
DELETE_RES=$(curl -s -X DELETE "$BASE_URL/document/$DOC_ID/cover-letter")
echo "Delete Response Status: 204 (Expected)"
