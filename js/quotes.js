// Quotes Module
// Handles daily inspiration quotes

const quotes = [
    {
        text: "For God speaks again and again, though people do not recognize it. He speaks in dreams, in visions of the night, when deep sleep falls on people as they lie in their beds.",
        author: "Job 33:14-15",
        version: "NLT"
    },
    {
        text: "I will pour out my Spirit on all people. Your sons and daughters will prophesy, your old men will dream dreams, your young men will see visions.",
        author: "Joel 2:28",
        version: "NIV"
    },
    {
        text: "In a dream, in a vision of the night, when deep sleep falls on men as they slumber in their beds, he may speak in their ears and terrify them with warnings.",
        author: "Job 33:15-16",
        version: "NIV"
    }
];

function refreshQuote() {
    const quoteText = document.getElementById('quote-text');
    const quoteMeta = document.getElementById('quote-meta');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteVersion = document.getElementById('quote-version');

    if (!quoteText || !quoteMeta || !quoteAuthor || !quoteVersion) return;

    // Get a random quote different from current if possible
    let randomQuote;
    do {
        randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (quoteText.textContent.includes(randomQuote.text) && quotes.length > 1);

    // Simple fade effect
    quoteText.style.opacity = '0';
    quoteMeta.style.opacity = '0';

    setTimeout(() => {
        quoteText.textContent = `"${randomQuote.text}"`;
        quoteAuthor.textContent = randomQuote.author;
        quoteVersion.textContent = randomQuote.version;

        quoteText.style.opacity = '1';
        quoteMeta.style.opacity = '1';
    }, 300);
}
