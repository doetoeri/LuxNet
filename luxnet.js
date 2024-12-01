const axios = require("axios");

const GITHUB_OWNER = "YourGitHubUsername"; // GitHub 사용자 이름
const GITHUB_REPO = "LuxNet"; // 저장소 이름
const GITHUB_TOKEN = "YourGitHubToken"; // Personal Access Token

const api = axios.create({
  baseURL: `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`,
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  },
});

async function readFile(filename) {
  try {
    const response = await api.get(`/${filename}`);
    const content = Buffer.from(response.data.content, "base64").toString("utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file '${filename}':`, error.message);
    return [];
  }
}

async function writeFile(filename, data) {
  try {
    const currentFile = await api.get(`/${filename}`);
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    await api.put(`/${filename}`, {
      message: `Update ${filename}`,
      content,
      sha: currentFile.data.sha,
    });

    console.log(`${filename} updated successfully.`);
  } catch (error) {
    console.error(`Error writing file '${filename}':`, error.message);
  }
}

async function register(username, password) {
  const users = await readFile("users.json");
  if (users.some((user) => user.username === username)) {
    return "Username already exists.";
  }
  users.push({ username, password });
  await writeFile("users.json", users);
  return "Registration successful.";
}

async function login(username, password) {
  const users = await readFile("users.json");
  const user = users.find((u) => u.username === username && u.password === password);
  return user ? "Login successful." : "Invalid credentials.";
}

async function createPost(author, title, content) {
  const posts = await readFile("posts.json");
  const newPost = { id: posts.length + 1, author, title, content };
  posts.push(newPost);
  await writeFile("posts.json", posts);
  return "Post created successfully.";
}

async function viewPosts() {
  const posts = await readFile("posts.json");
  return posts.map((p) => `${p.id}: ${p.title} by ${p.author}`).join("\n");
}

async function editPost(postId, author, newTitle, newContent) {
  const posts = await readFile("posts.json");
  const post = posts.find((p) => p.id === postId && p.author === author);
  if (!post) return "Post not found or you are not the author.";
  post.title = newTitle;
  post.content = newContent;
  await writeFile("posts.json", posts);
  return "Post updated successfully.";
}

async function deletePost(postId, author) {
  const posts = await readFile("posts.json");
  const filteredPosts = posts.filter((p) => p.id !== postId || p.author !== author);
  if (filteredPosts.length === posts.length) return "Post not found or you are not the author.";
  await writeFile("posts.json", filteredPosts);
  return "Post deleted successfully.";
}

module.exports = {
  register,
  login,
  createPost,
  viewPosts,
  editPost,
  deletePost,
};
