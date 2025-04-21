const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your actual JDoodle credentials
const clientId = "3b2b671db2946ec7e0292549f76a3d3a";  // Your Client ID from JDoodle
const clientSecret = "9327e04ef055651ea502ff1be105f8d8596b533140b540794e51029fbe1dc1ab";  // Your Client Secret from JDoodle

// Map the languages supported by JDoodle API
const langMap = {
  python3: "python3",  // Python 3
  cpp: "cpp17",        // C++ (version 17)
  java: "java",        // Java
  javascript: "nodejs", // JavaScript (Node.js)
  ruby: "ruby",        // Ruby
  php: "php",          // PHP
  c: "c",              // C
  go: "go",            // Go (Golang)
  kotlin: "kotlin",    // Kotlin
  rust: "rust",        // Rust
  swift: "swift",      // Swift
};

// Modify Java code if it doesn't have a class (wrap in default Main class)
const processJavaCode = (code) => {
  if (!/public class [A-Za-z0-9]+/.test(code)) {
    return `public class Main {\npublic static void main(String[] args) {\n${code}\n}\n}`;
  }
  return code;
};

app.post("/compile", async (req, res) => {
  const { code, language, stdin } = req.body;

  // If the language is Java, process the code to include a main class if necessary
  let processedCode = code;
  if (language === "java") {
    processedCode = processJavaCode(code);
  }

  // Prepare the payload to send to JDoodle API
  const payload = {
    script: processedCode,
    language: langMap[language] || "python3", // Default to Python 3 if language not found
    versionIndex: "0",  // Version index to define which version of the language to use
    stdin: stdin || "",  // If no stdin provided, send an empty string
    clientId,
    clientSecret,
  };

  try {
    // Send the request to JDoodle API
    const result = await axios.post("https://api.jdoodle.com/v1/execute", payload);
    // Respond with the output from JDoodle
    res.json({ output: result.data.output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Execution failed" });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
