document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Chatbot carregado com sucesso!");

    const inputText = document.getElementById("inputText");
    const sendButton = document.getElementById("sendButton");
    const chatBox = document.getElementById("chat-box");
    const voiceToggle = document.getElementById("voiceToggle");

    if (!inputText || !sendButton || !chatBox || !voiceToggle) {
        console.error("❌ Erro: Elementos do chat não foram encontrados.");
        return;
    }

    let chatHistory = []; // Armazena histórico da conversa

    sendButton.addEventListener("click", processMessage);
    inputText.addEventListener("keypress", (event) => {
        if (event.key === "Enter") processMessage();
    });

    async function processMessage() {
        const message = inputText.value.trim();
        if (!message) return;

        appendMessage("user", message);
        inputText.value = "";
        inputText.focus();

        appendLoadingMessage();

        try {
            const response = await generateResponse(message);
            updateLastBotMessage(response);
            if (voiceToggle.checked) speak(response);
            chatHistory.push({ user: message, bot: response });
        } catch (error) {
            console.error("❌ Erro ao gerar resposta:", error);
            updateLastBotMessage("⚠️ Desculpe, ocorreu um erro ao processar a resposta.");
        }
    }

    function appendMessage(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender === "user" ? "user-message" : "bot-message");
        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        scrollToBottom();
    }

    function appendLoadingMessage() {
        const loadingElement = document.createElement("div");
        loadingElement.classList.add("message", "bot-message", "loading-message");
        loadingElement.textContent = "⏳ Processando...";
        chatBox.appendChild(loadingElement);
        scrollToBottom();
    }

    function updateLastBotMessage(text) {
        const botMessages = chatBox.getElementsByClassName("bot-message");
        if (botMessages.length > 0) {
            botMessages[botMessages.length - 1].textContent = text;
        }
    }

    function speak(text) {
        const synth = window.speechSynthesis;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 1.1; // Ajuste da velocidade da fala
        utterance.pitch = 1.2; // Ajuste do tom da voz
        synth.speak(utterance);
    }

    async function generateResponse(question) {
        if (typeof responses === "undefined") {
            console.error("❌ Erro: responses.js não foi carregado corretamente.");
            return "Erro ao acessar base de conhecimento.";
        }

        question = sanitizeText(question);

        for (const category in responses) {
            if (responses[category][question]) {
                return responses[category][question];
            }
        }

        let bestMatch = null;
        let highestSimilarity = 0;

        for (const category in responses) {
            for (const key in responses[category]) {
                const similarity = jaccardSimilarity(question, sanitizeText(key));
                if (similarity > highestSimilarity) {
                    highestSimilarity = similarity;
                    bestMatch = responses[category][key];
                }
            }
        }

        if (highestSimilarity >= 0.6) {
            return bestMatch;
        } else {
            return await searchOnline(question);
        }
    }

    async function searchOnline(query) {
        const API_KEY = "SUA_CHAVE_DE_API"; 
        const endpoint = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(endpoint, {
                headers: { "Ocp-Apim-Subscription-Key": API_KEY }
            });

            if (!response.ok) throw new Error("Erro na busca externa");

            const data = await response.json();
            if (data.webPages && data.webPages.value.length > 0) {
                return `🔎 Aqui está algo que encontrei: **${data.webPages.value[0].name}** - ${data.webPages.value[0].snippet} [🔗 Acesse](${data.webPages.value[0].url})`;
            } else {
                return "❌ Não encontrei nada sobre isso.";
            }
        } catch (error) {
            console.error("❌ Erro ao buscar na web:", error);
            return "⚠️ Não consegui encontrar informações externas.";
        }
    }

    function sanitizeText(text) {
        return text.toLowerCase().replace(/[^\w\s]/gi, "").trim();
    }

    function jaccardSimilarity(str1, str2) {
        const set1 = new Set(str1.split(/\s+/));
        const set2 = new Set(str2.split(/\s+/));
        const intersection = new Set([...set1].filter(word => set2.has(word))).size;
        const union = set1.size + set2.size - intersection;
        return union === 0 ? 0 : intersection / union;
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    }

    // 🔥 Adicionando Autocompletar para histórico de conversas
    inputText.addEventListener("input", () => {
        const lastMessages = chatHistory.map(entry => entry.user);
        const suggestions = lastMessages.filter(msg => msg.startsWith(inputText.value)).slice(-3);
        showAutocompleteSuggestions(suggestions);
    });

    function showAutocompleteSuggestions(suggestions) {
        const autocompleteBox = document.getElementById("autocomplete-box");
        if (!autocompleteBox) return;

        autocompleteBox.innerHTML = "";
        suggestions.forEach(suggestion => {
            const div = document.createElement("div");
            div.classList.add("autocomplete-suggestion");
            div.textContent = suggestion;
            div.addEventListener("click", () => {
                inputText.value = suggestion;
                autocompleteBox.innerHTML = "";
            });
            autocompleteBox.appendChild(div);
        });
    }
});
