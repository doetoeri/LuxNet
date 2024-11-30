class LuxOS {
    constructor() {
        this.apiUrl = "https://api.github.com/repos/doetoeri/LuxOSNet/contents/square.json"; // 데이터베이스 URL
        this.headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": "Bearer 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", // 새 Personal Access Token
        };
        this.networks = {
            "SEOHAN123": "서한 전자",
            "GROUP456": "서한 그룹",
            "SAVIT789": "새빛 소프텍",
        };
        this.currentNetwork = null; // 현재 연결된 네트워크
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

    async executeCommand(input) {
        const [command, ...args] = input.split(" ");
        if (this.commands[command]) {
            const result = await this.commands[command](args.join(" "));
            return result;
        }
        return `Unknown command: ${command}`;
    }

    connectToNetwork(key) {
        if (!this.networks[key]) {
            return "Invalid key. Connection failed.";
        }
        this.currentNetwork = key;
        return `Connected to ${this.networks[key]}.`;
    }

    async viewSquare() {
        if (!this.currentNetwork) return "No network connected. Use 'connect <key>' to connect.";
        try {
            const response = await fetch(this.apiUrl, { headers: this.headers });
            if (!response.ok) throw new Error(`Failed to fetch Square data. Status: ${response.status}`);
            const data = await response.json();
            const content = atob(data.content); // Base64 디코딩
            const database = JSON.parse(content);

            if (!database[this.currentNetwork] || database[this.currentNetwork].length === 0) {
                return `${this.networks[this.currentNetwork]} Square is empty.`;
            }

            return `${this.networks[this.currentNetwork]} Square Messages:\n${database[this.currentNetwork].join("\n")}`;
        } catch (err) {
            return `Error: ${err.message}`;
        }
    }

    async postToSquare(content) {
        if (!this.currentNetwork) return "No network connected. Use 'connect <key>' to connect.";
        if (!content) return "Usage: post <message>";
        try {
            const response = await fetch(this.apiUrl, { headers: this.headers });
            if (!response.ok) throw new Error(`Failed to fetch Square data. Status: ${response.status}`);
            const data = await response.json();
            const database = JSON.parse(atob(data.content));

            if (!database[this.currentNetwork]) database[this.currentNetwork] = [];
            database[this.currentNetwork].push(content);

            await fetch(this.apiUrl, {
                method: "PUT",
                headers: this.headers,
                body: JSON.stringify({
                    message: `Updated Square data for ${this.networks[this.currentNetwork]}`,
                    content: btoa(JSON.stringify(database)), // Base64 인코딩
                    sha: data.sha, // 파일 SHA
                }),
            });
            return "Message posted.";
        } catch (err) {
            return `Error: ${err.message}`;
        }
    }

    disconnect() {
        if (!this.currentNetwork) return "No network connected.";
        const networkName = this.networks[this.currentNetwork];
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
                output.textContent += `> ${command}\n${result}`;
                inputField.value = ""; // 입력 필드 초기화
                output.scrollTop = output.scrollHeight; // 스크롤을 가장 아래로 이동
            }
        }
    });
});
