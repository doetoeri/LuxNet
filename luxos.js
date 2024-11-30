class LuxOS {
    constructor() {
        this.networks = [
            { name: "SAVIT* SOFTECH", key: "savitsf123", square: [] },
            { name: "SEOHAN GROUP", key: "seohangrp456", square: [] },
        ];
        this.connectedNetwork = null; // 현재 연결된 전산망
        this.commands = {};
        this.initCommands();
    }

    initCommands() {
        this.commands = {
            connect: (key) => this.connectToNetwork(key),
            disconnect: () => this.disconnectFromNetwork(),
            post: (content) => this.postToSquare(content),
            view: () => this.viewSquare(),
            help: () =>
                "Commands: connect <key>, disconnect, post <message>, view",
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
        const network = this.networks.find((net) => net.key === key);
        if (!network) return "Invalid key. Connection failed.";
        this.connectedNetwork = network;
        return `Connected to ${network.name}.`;
    }

    disconnectFromNetwork() {
        if (!this.connectedNetwork) return "No network connected.";
        const networkName = this.connectedNetwork.name;
        this.connectedNetwork = null;
        return `Disconnected from ${networkName}.`;
    }

    postToSquare(content) {
        if (!this.connectedNetwork) return "No network connected.";
        if (!content) return "Usage: post <message>";
        this.connectedNetwork.square.push(content);
        return `Message posted to ${this.connectedNetwork.name} Square.`;
    }

    viewSquare() {
        if (!this.connectedNetwork) return "No network connected.";
        const messages = this.connectedNetwork.square;
        return messages.length
            ? `Square Messages:\n${messages.join("\n")}`
            : "Square is empty.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const luxOS = new LuxOS();
    const inputField = document.getElementById("input");
    const output = document.getElementById("output");

    const execute = () => {
        const command = inputField.value.trim();
        if (command) {
            const result = luxOS.executeCommand(command);
            output.textContent += `> ${command}\n${result}\n`;
            inputField.value = '';
        }
    };

    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") execute();
    });
});
