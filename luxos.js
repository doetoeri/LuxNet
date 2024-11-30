class LuxOS {
    constructor() {
        this.apiUrl = "https://api.github.com/repos/<username>/luxos-square/contents/square.json";
        this.headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": "Bearer <your_github_token>", // Personal Access Token
        };
        this.commands = {};
        this.initCommands();
    }

    initCommands() {
        this.commands = {
            view: () => this.viewSquare(),
            post: (content) => this.postToSquare(content),
            help: () =>
                "Commands: view, post <message>",
        };
    }

    async viewSquare() {
        try {
            const response = await fetch(this.apiUrl, { headers: this.headers });
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
            const data = await response.json();
            const existingContent = JSON.parse(atob(data.content));

            // 새 메시지 추가
            existingContent.push(content);

            // 업데이트 요청
            await fetch(this.apiUrl, {
                method: "PUT",
                headers: this.headers,
                body: JSON.stringify({
                    message: "Updated Square data",
                    content: btoa(JSON.stringify(existingContent)), // Base64 인코딩
                    sha: data.sha,
                }),
            });
            return "Message posted.";
        } catch (err) {
            return `Error: ${err.message}`;
        }
    }
}
