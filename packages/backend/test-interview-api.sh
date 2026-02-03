#!/bin/bash

# Interview API Test Script
# Tests based on seeds.sql data (User 1)

BASE_URL="http://localhost:8000"

echo "======================================"
echo "Interview API Test (User 1) - Starting"
echo "======================================"
echo "Note: Currently backend hardcodes userId='1', so we test User 1's data."
echo ""

# 1. List Interviews
echo "[TEST 1] GET /interview - List Interviews for User 1"
# Should return at least Interview 1 from seeds.sql
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/interview?page=1&take=10&sort=DESC")
echo "Response: $LIST_RESPONSE"
echo ""

# 2. Get Seeded Interview (ID: 1) Details
echo "[TEST 2] GET /interview/1/time - Get Interview 1 Time"
TIME_RESPONSE=$(curl -s -X GET "$BASE_URL/interview/1/time")
echo "Response: $TIME_RESPONSE"
echo ""

echo "[TEST 3] GET /interview/1/chat/history - Get Interview 1 Chat History"
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/interview/1/chat/history")
echo "Response length: ${#HISTORY_RESPONSE} chars"
echo ""

echo "[TEST 4] GET /interview/1/feedback - Get Interview 1 Feedback"
FEEDBACK_RESPONSE=$(curl -s -X GET "$BASE_URL/interview/1/feedback")
echo "Response: $FEEDBACK_RESPONSE"
echo ""

# 3. Create New Tech Interview with Documents from Seed (ID: 1, 2)
echo "[TEST 5] POST /interview/tech/create - Create with Documents 1 & 2"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/interview/tech/create" \
  -H "Content-Type: application/json" \
  -d '{
    "documentIds": ["1", "2"]
  }')
echo "Response: $CREATE_RESPONSE"

NEW_INTERVIEW_ID=$(echo "$CREATE_RESPONSE" | grep -o '"interviewId":"[^"]*"' | cut -d'"' -f4)
QUESTION_ID=$(echo "$CREATE_RESPONSE" | grep -o '"questionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$NEW_INTERVIEW_ID" ]; then
    echo "❌ Failed to create interview"
    exit 1
fi

echo "✅ Created Interview ID: $NEW_INTERVIEW_ID"
echo "✅ First Question ID: $QUESTION_ID"
echo ""

# 4. Answer the Question
echo "[TEST 6] POST /interview/answer/chat - Answer the question"
ANSWER_RESPONSE=$(curl -s -X POST "$BASE_URL/interview/answer/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"interviewId\": \"$NEW_INTERVIEW_ID\",
    \"answer\": \"제 강점은 끈기입니다. (Test Answer)\"
  }")
echo "Response: $ANSWER_RESPONSE"
echo ""

# 5. Stop Interview
echo "[TEST 7] POST /interview/stop - Stop Interview"
curl -s -X POST "$BASE_URL/interview/stop" \
  -H "Content-Type: application/json" \
  -d "{
    \"interviewId\": \"$NEW_INTERVIEW_ID\"
  }"
echo ""
echo "Stopped Interview."
echo ""

# 6. Delete the Created Interview
echo "[TEST 8] DELETE /interview/:id - Delete the new interview"

# Check DB before deletion
echo "Checking DB before deletion..."
docker exec web23-mysql mysql -uuser -ppassword web23 -e "SELECT COUNT(*) as Q_Count FROM interviews_questions WHERE interview_id=$NEW_INTERVIEW_ID;"
docker exec web23-mysql mysql -uuser -ppassword web23 -e "SELECT COUNT(*) as A_Count FROM interviews_answers WHERE interview_id=$NEW_INTERVIEW_ID;"

DELETE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/interview/$NEW_INTERVIEW_ID")

if [ "$DELETE_CODE" == "204" ]; then
    echo "✅ Delete successful (Status 204)"
else
    echo "❌ Delete failed (Status $DELETE_CODE)"
fi
echo ""

# 6.1 Verify Cascaded Deletion in DB
echo "[TEST 8-1] Verify Cascaded Deletion in DB"
echo "Checking related tables for interview_id=$NEW_INTERVIEW_ID..."

# Check Questions
Q_COUNT=$(docker exec web23-mysql mysql -uuser -ppassword web23 -N -e "SELECT COUNT(*) FROM interviews_questions WHERE interview_id=$NEW_INTERVIEW_ID")
# Check Answers
A_COUNT=$(docker exec web23-mysql mysql -uuser -ppassword web23 -N -e "SELECT COUNT(*) FROM interviews_answers WHERE interview_id=$NEW_INTERVIEW_ID")
# Check Technical Interview
T_COUNT=$(docker exec web23-mysql mysql -uuser -ppassword web23 -N -e "SELECT COUNT(*) FROM technical_interviews WHERE interview_id=$NEW_INTERVIEW_ID")
# Check Interview Documents (Wait, this is linked to Technical Interview usually? Or direct? The entity says linked to Technical Interview or Document? Let's check relation)
# Looking at entities: InterviewDocument -> TechnicalInterview. So if TechnicalInterview is deleted, InterviewDocument should be gone too.
# Let's find the technical interview ID first to check docs? Or just trust technical interview deletion for now. 
# Actually, InterviewDocument has "technical_interview_id". If TechnicalInterview is cascaded, then InterviewDocument should also be cascaded.
# Let's check TechnicalInterview count.

if [ "$Q_COUNT" == "0" ] && [ "$A_COUNT" == "0" ] && [ "$T_COUNT" == "0" ]; then
    echo "✅ Cascade Deletion Verified: Questions ($Q_COUNT), Answers ($A_COUNT), Tech info ($T_COUNT) are all 0."
else
    echo "❌ Cascade Deletion Failed!"
    echo "Questions: $Q_COUNT (Expected 0)"
    echo "Answers: $A_COUNT (Expected 0)"
    echo "Technical: $T_COUNT (Expected 0)"
    exit 1
fi
echo ""

# 7. Verify Seeded Interview 1 still exists (Cascade check - ensure we didn't delete everything)
echo "[TEST 9] GET /interview/1/time - Verify Interview 1 still exists"
VERIFY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/interview/1/time")

if [ "$VERIFY_CODE" == "200" ]; then
    echo "✅ Interview 1 is safe (Status 200)"
else
    echo "❌ Interview 1 is missing! (Status $VERIFY_CODE)"
fi

echo "======================================"
echo "Interview API Test - Completed"
echo "======================================"
