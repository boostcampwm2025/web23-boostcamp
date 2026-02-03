
const BASE_URL = 'http://localhost:8000';

// Native fetch is available in Node 18+
// If running on older node, might need undici or node-fetch, but user is on v22.

const runTest = async () => {
    console.log('🚀 Starting API Test...');

    // Helper: Delay to allow server to process if needed (rarely needed but good for logs)
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // ==========================================
    // 1. Portfolio Test
    // ==========================================
    console.log('\n------------------------------------------------');
    console.log('📂 Testing Portfolio APIs');
    console.log('------------------------------------------------');

    let portfolioDocId = null;

    // 1-1. Upload Portfolio
    console.log('[POST] /document/portfolio/create');
    const createPortfolioBody = {
        title: 'My Awesome Portfolio',
        content: 'This is the content of my portfolio.'
    };
    
    try {
        const res = await fetch(`${BASE_URL}/document/portfolio/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createPortfolioBody)
        });

        if (res.status === 201 || res.status === 200) {
            const data = await res.json();
            console.log('✅ Created:', data);
            portfolioDocId = data.documentId;
            
            // Basic Validation
            if (data.title !== createPortfolioBody.title) console.error('❌ Title mismatch');
            if (data.content !== createPortfolioBody.content) console.error('❌ Content mismatch');
        } else {
            console.error(`❌ Failed: ${res.status} ${await res.text()}`);
        }
    } catch (error) {
        console.error('❌ Network Error (Is the server running?):', error.message);
    }



    // 1-2. Update Portfolio
    if (portfolioDocId) {
        console.log(`\n[PATCH] /document/${portfolioDocId}/portfolio`);
        const updatePortfolioBody = {
            title: 'Updated Portfolio Title',
            content: 'Updated content...'
        };

        try {
            const res = await fetch(`${BASE_URL}/document/${portfolioDocId}/portfolio`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePortfolioBody)
            });

            if (res.status === 200) {
                const data = await res.json();
                console.log('✅ Updated:', data);

                if (data.title !== updatePortfolioBody.title) console.error('❌ Title mismatch');
                if (data.content !== updatePortfolioBody.content) console.error('❌ Content mismatch');
                if (!data.modifiedAt) console.error('❌ ModifiedAt missing');
            } else {
                console.error(`❌ Failed: ${res.status} ${await res.text()}`);
            }
        } catch (error) {
            console.error('❌ Network Error:', error.message);
        }
    }

    // 1-3. View Portfolio
    if (portfolioDocId) {
        console.log(`\n[GET] /document/${portfolioDocId}/portfolio`);
        try {
            const res = await fetch(`${BASE_URL}/document/${portfolioDocId}/portfolio`);
            if (res.status === 200) {
                const data = await res.json();
                console.log('✅ Retrieved:', data);

                if (data.documentId !== portfolioDocId) console.error('❌ ID mismatch');
                if (data.title !== 'Updated Portfolio Title') console.error('❌ Title mismatch after update');
            } else {
                console.error(`❌ Failed: ${res.status} ${await res.text()}`);
            }
        } catch (error) {
             console.error('❌ Network Error:', error.message);
        }
    }

    // 1-3. Delete Portfolio
    if (portfolioDocId) {
        console.log(`\n[DELETE] /document/${portfolioDocId}/portfolio`);
        try {
            const res = await fetch(`${BASE_URL}/document/${portfolioDocId}/portfolio`, {
                method: 'DELETE'
            });
            if (res.status === 204) {
                console.log('✅ Deleted successfully');
            } else {
                console.error(`❌ Failed: ${res.status} ${await res.text()}`);
            }
        } catch (error) {
             console.error('❌ Network Error:', error.message);
        }
    }

    // ==========================================
    // 2. Cover Letter Test
    // ==========================================
    console.log('\n------------------------------------------------');
    console.log('📝 Testing Cover Letter APIs');
    console.log('------------------------------------------------');

    let coverLetterDocId = null;

    // 2-1. Upload Cover Letter
    console.log('[POST] /document/cover-letter/create');
    const createCoverLetterBody = {
        title: 'My Cover Letter',
        content: [
            { question: 'Why apply?', answer: 'Because I love coding.' },
            { question: 'Strengths?', answer: 'Debugging and persistence.' }
        ]
    };

    try {
        const res = await fetch(`${BASE_URL}/document/cover-letter/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createCoverLetterBody)
        });

        if (res.status === 201 || res.status === 200) {
            const data = await res.json();
            console.log('✅ Created:', JSON.stringify(data, null, 2));
            coverLetterDocId = data.documentId;

            // Basic Validation
            if (data.content.length !== 2) console.error('❌ Content length mismatch');
        } else {
            console.error(`❌ Failed: ${res.status} ${await res.text()}`);
        }
    } catch (error) {
        console.error('❌ Network Error (Is the server running?):', error.message);
    }

    // 2-2. View Cover Letter
    if (coverLetterDocId) {
        console.log(`\n[GET] /document/${coverLetterDocId}/cover-letter`);
        try {
            const res = await fetch(`${BASE_URL}/document/${coverLetterDocId}/cover-letter`);
            if (res.status === 200) {
                const data = await res.json();
                console.log('✅ Retrieved:', JSON.stringify(data, null, 2));

                if (data.documentId !== coverLetterDocId) console.error('❌ ID mismatch');
                if (data.content[0].question !== createCoverLetterBody.content[0].question) console.error('❌ Question mismatch');
            } else {
                console.error(`❌ Failed: ${res.status} ${await res.text()}`);
            }
        } catch (error) {
             console.error('❌ Network Error:', error.message);
        }
    }

    // 2-3. Update Cover Letter
    if (coverLetterDocId) {
        console.log(`\n[PUT] /document/${coverLetterDocId}/cover-letter`);
        const updateCoverLetterBody = {
            title: 'Updated Cover Letter Title',
            content: [
                { question: 'Why apply?', answer: 'Revised answer.' },
                { question: 'Strengths?', answer: 'Revised strengths.' }
            ]
        };

        try {
            const res = await fetch(`${BASE_URL}/document/${coverLetterDocId}/cover-letter`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateCoverLetterBody)
            });

            if (res.status === 200) {
                const data = await res.json();
                console.log('✅ Updated:', JSON.stringify(data, null, 2));

                if (data.title !== updateCoverLetterBody.title) console.error('❌ Title mismatch');
                if (data.content.length !== 2) console.error('❌ Content length mismatch');
                if (data.content[0].answer !== updateCoverLetterBody.content[0].answer) console.error('❌ Answer mismatch');
                if (!data.modifiedAt) console.error('❌ ModifiedAt missing');
            } else {
                console.error(`❌ Failed: ${res.status} ${await res.text()}`);
            }
        } catch (error) {
            console.error('❌ Network Error:', error.message);
        }
    }

    // 2-3. Delete Cover Letter
    if (coverLetterDocId) {
        console.log(`\n[DELETE] /document/${coverLetterDocId}/cover-letter`);
        try {
            const res = await fetch(`${BASE_URL}/document/${coverLetterDocId}/cover-letter`, {
                method: 'DELETE'
            });
            if (res.status === 204) {
                console.log('✅ Deleted successfully');
            } else {
                console.error(`❌ Failed: ${res.status} ${await res.text()}`);
            }
        } catch (error) {
             console.error('❌ Network Error:', error.message);
        }
    }
    
    // Warn if no IDs obtained
    if (!portfolioDocId && !coverLetterDocId) {
        console.log('\n⚠️ No documents were created, so subsequent steps were skipped.');
        console.log('Please ensure the backend server is running on port 3000.');
    }
};

runTest();
