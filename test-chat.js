
async function testChat() {
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: '우산 발명품 찾아줘' }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body;
        for await (const chunk of reader) {
            process.stdout.write(chunk.toString());
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testChat();
