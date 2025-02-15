import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 10,
  duration: "5s",
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
    user_message: "hello",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  for (let i = 0; i < 10; i++) {
    const response = http.post(url, payload, params);
    if (response.status !== 200) {
      console.error(`Error: ${response.status}`);
    }
    sleep(1);
  }
}
