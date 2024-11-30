class LuxOS {
    constructor() {
        this.apiUrl = "https://api.github.com/repos/doetoeri/luxos-square/contents/square.json"; // doetoeri 계정의 Repository
        this.headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": "Bearer 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", // Personal Access Token
        };
        this.commands = {};
        this.initCommands();
    }

    initCommands() {
        this.commands = {
            view: () => this.viewSquare(),
            post: (content) => this.postToSquare(content),
            help: () => "Commands: view, post <message>",
        };
    }

    executeCommand(input) {
        const [command, ...args] = input.split(" ");
        if (this.commands[command]) {
            return this.commands[command](args.join(" "));
        }
        return `Unknown command: ${command}`;
    }

    async viewSquare() {
        try {
            const response = await fetch(this.apiUrl, { headers: this.headers });
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
        if (!content) return "Usage: post <message>";
        try {
            // 기존 데이터 가져오기
            const response = await fetch(this.apiUrl, { headers: this.headers });
            if (!response.ok) throw new Error("Failed to fetch Square data.");
            const data = await response.json();
            const existingContent = JSON.parse(atob(data.content));

            // 새 메시지 추가
            existingContent.push(content);

            // 데이터 업데이트
            await fetch(this.apiUrl, {
                method: "PUT",
                headers: this.headers,
                body: JSON.stringify({
                    message: "Updated Square data",
                    content: btoa(JSON.stringify(existingContent)), // Base64 인코딩
                    sha: data.sha, // 파일의 현재 SHA
                }),
            });
            return "Message posted.";
        } catch (err) {
            return `Error: ${err.message}`;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const luxOS = new LuxOS();
    const inputField = document.getElementById("input");
    const output = document.getElementById("output");

    const execute = () => {
        const command = inputField.value.trim();
        if (command) {
            luxOS.executeCommand(command).then((result) => {
                output.textContent += `> ${command}\n${result}\n`;
                inputField.value = "";
            });
        }
    };

    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") execute();
    });
});
