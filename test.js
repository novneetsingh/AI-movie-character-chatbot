import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '5s',
  cloud: {
    // Project: ai-chatbot
    projectID: 3747731,
    // Test runs with the same name groups test runs together.
    name: 'Test1'
  }
};

export default function() {
    http.post('https://localhost:5000/chat', JSON.stringify({ character: 'john wick', user_message: 'hello' }));
  sleep(1);
}