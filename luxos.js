class LuxOS {
    constructor() {
        // 각 전산망의 API URL과 고유 키
        this.networks = {
            "seohan-electronics": {
                apiUrl: "https://api.github.com/repos/doetoeri/seohan-electronics-square/contents/square.json",
                key: "SEOHAN123",
            },
            "seohan-group": {
                apiUrl: "https://api.github.com/repos/doetoeri/seohan-group-square/contents/square.json",
                key: "GROUP456",
            },
            "savit-softech": {
                apiUrl: "https://api.github.com/repos/doetoeri/savit-softech-square/contents/square.json",
                key: "SAVIT789",
            },
        };
        this.currentNetwork = null; // 현재 연결된 전산망
        this.headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": "Bearer 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",
        };
        this.commands = {};
        this.initCommands();
    }

    initCommands() {
        this.commands = {
            connect: (key) => this.connectToNetwork(key),
            view: () => this.viewSquare(),
            post: (content) => this.postToSquare(content),
            disconnect: () => this.disconnect(),
            help: () => "Commands: connect <key>, view, post <message>, disconnect",
        };
    }

    executeCommand(input) {
        const [command, ...args] = input.split(" ");
        if (this.commands[command]) {
            return this.commands[command](args.join(" "));
        }
        return `Unknown command: ${command}`;
    }

    connectToNetwork(key) {
        const network = Object.values(this.networks).find((net) => net.key === key);
        if (!network) {
            return "Invalid key. Connection failed.";
        }
        this.currentNetwork = network;
        return `Connected to ${Object.keys(this.networks).find((k) => this.networks[k] === network)}.`;
    }

    async viewSquare() {
        if (!this.currentNetwork) return "No network connected. Use 'connect <key>' to connect.";
        try {
            const response = await fetch(this.currentNetwork.apiUrl, { headers: this.headers });
            if (!response.ok) throw new Error("Failed to fetch Square data.");
            const data = await response.json();
            const content = atob(data.content); // Base64 디코딩
            const messages = JSON.parse(content);
            return messages.length
                ? `Square Messages:\n${messages.join("\n")}`
                : "Square is empty.";
        } catch (err) {
            return `Error: ${err.message}`;
        }
    }

    async postToSquare(content) {
        if (!this.currentNetwork) return "No network connected. Use 'connect <key>' to connect.";
        if (!content) return "Usage: post <message>";
        try {
            const response = await fetch(this.currentNetwork.apiUrl, { headers: this.headers });
            if (!response.ok) throw new Error("Failed to fetch Square data.");
            const data = await response.json();
            const existingContent = JSON.parse(atob(data.content));

            existingContent.push(content);

            await fetch(this.currentNetwork.apiUrl, {
                method: "PUT",
                headers: this.headers,
                body: JSON.stringify({
                    message: "Updated Square data",
                    content: btoa(JSON.stringify(existingContent)), // Base64 인코딩
                    sha: data.sha, // 파일의 SHA
                }),
            });
            return "Message posted.";
        } catch (err) {
            return `Error: ${err.message}`;
        }
    }

    disconnect() {
        if (!this.currentNetwork) return "No network connected.";
        const networkName = Object.keys(this.networks).find((key) => this.networks[key] === this.currentNetwork);
        this.currentNetwork = null;
        return `Disconnected from ${networkName}.`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const luxOS = new LuxOS();
    const inputField = document.getElementById("input");
    const output = document.getElementById("output");

    // Enter 입력 시 명령어 처리
    inputField.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            const command = inputField.value.trim();
            if (command) {
                const result = await luxOS.executeCommand(command);
                output.textContent += `\n> ${command}\n${result}`;
                inputField.value = ""; // 입력 필드 초기화
                output.scrollTop = output.scrollHeight; // 스크롤을 가장 아래로 이동
            }
        }
    });
});
