// Native fetch is used (Node 18+)
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const MAX_TURNS = 5;
const LOG_FILE = 'safety-verification-log.txt';

// Append to log instead of clearing (or use a new file per run if preferred, but for now append)
// fs.writeFileSync(LOG_FILE, ''); // Commented out to prevent data loss


function log(msg, data = null) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg} ${data ? JSON.stringify(data) : ''}`;
    console.log(logMsg);
    fs.appendFileSync(LOG_FILE, logMsg + '\n');
}

function generateSmartAnswer(question) {
    if (!question) return "질문이 없습니다.";
    
    if (question.includes('프로젝트') || question.includes('경험')) {
        return "최근에 대규모 이커머스 웹사이트의 프론트엔드 성능 최적화 프로젝트를 담당했습니다. React와 Next.js를 사용하여 SEO와 로딩 속도를 개선했습니다.";
    }
    if (question.includes('어려움') || question.includes('문제') || question.includes('트레이드오프')) {
        return "CSR과 SSR의 장단점을 고려했습니다. Next.js의 SSR은 초기 로딩은 빠르지만 서버 부하가 증가하는 트레이드오프가 있어, 정적 페이지에는 SSG를 혼용했습니다.";
    }
    if (question.includes('기술') || question.includes('스택') || question.includes('언어')) {
        return "HTML, CSS, TypeScript를 기본으로 하며, 스타일링에는 Tailwind CSS를 사용했습니다. 빌드 도구로는 Vite를 도입하여 개발 환경 속도를 높였습니다.";
    }
    if (question.includes('성능') || question.includes('최적화')) {
        return "Lighthouse 점수를 높이기 위해 이미지 최적화(WebP), 코드 스플리팅, 그리고 서버 사이드 렌더링(SSR)을 적용하여 FCP를 50% 단축했습니다.";
    }
    if (question.includes('마지막') || question.includes('포부')) {
        return "사용자 경험(UX)에 집착하는 프론트엔드 엔지니어로 성장하고 싶습니다. 단순 구현을 넘어 웹 접근성과 인터랙션 디자인까지 깊이 있게 다루고 싶습니다.";
    }

    return "네, 프론트엔드 개발 관점에서 매우 흥미로운 주제입니다. 저는 브라우저 렌더링 원리를 이해하고 코드를 작성하려고 노력합니다.";
}


async function runTest() {
    log('>>> Starting Interview TTL (Time Limit) Verification with Interaction on ' + BASE_URL);

    try {
        // 1. Create Interview
        log('[1] Creating Interview...');
        const createRes = await fetch(`${BASE_URL}/interview/tech/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                simulationTitle: "TTL Interaction Test",
                documentIds: [] 
            })
        });

        if (!createRes.ok) {
            log('Failed to create interview:', await createRes.text());
            return;
        }

        const createData = await createRes.json();
        const interviewId = createData.interviewId;
        log(`[+] Interview Created. ID: ${interviewId}`);
        log(`[+] Q1 received.`);

        // 2. Perform one normal turn (Fast)
        log(`[2] Performing 1st Turn (Before Timeout)...`);
        await fetch(`${BASE_URL}/interview/answer/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interviewId, answer: "네, 첫 번째 답변입니다." })
        });
        
        const q2Res = await fetch(`${BASE_URL}/interview/tech/question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interviewId })
        });
        const q2Data = await q2Res.json();
        log(`[Server Res (Turn 1)] Question: ${q2Data.question}`); 
        log(`[+] Turn 1 completed. Q2 generated.`);

        // 3. Wait for TTL to expire
        log(`[3] Waiting 6 seconds to trigger timeout...`);
        await new Promise(r => setTimeout(r, 6000));

        // 4. Try to get next question (After Timeout)
        log(`[+] Time passed. Sending answer and requesting next...`);
        
        await fetch(`${BASE_URL}/interview/answer/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interviewId, answer: "시간이 지났나요?" })
        });

        const questionRes = await fetch(`${BASE_URL}/interview/tech/question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interviewId })
        });

        const qData = await questionRes.json();
        
        log(`[Server Res] isLast: ${qData.isLast}`);
        log(`[Server Res] Question: ${qData.question || 'null'}`);

        if (qData.isLast) {
            log('✅ SUCCESS: Interview terminated due to Time Limit after interaction.');
        } else {
            log('❌ FAILURE: Interview did NOT terminate after time limit.');
        }

    } catch (error) {
        log('Test Execution Error:', error);
    }
}

runTest();
