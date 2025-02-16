const http = require("k6/http");
const { sleep } = require("k6");

export const options = {
  vus: 10,
  duration: "10s",
  cloud: {
    // Project: ai-chatbot
    projectID: 3747731,
    // Test runs with the same name groups test runs together.
    name: "Test1",
  },
};

export default function () {
  const url = "http://localhost:5000/chat"; // Use http if your local server doesn't support https
  const payload = JSON.stringify({
    character: "john wick",
    user_message: "who killed your dog?",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  http.post(url, payload, params);

  sleep(1);
}
