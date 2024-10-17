const io = require('socket.io-client');
const axios = require('axios');

const SOCKET_SERVER_URL = 'http://localhost:3003'; // Replace with your server URL
const API_URL = 'http://localhost:3003/api/match'; // Replace with your API endpoint

/**
 * Client class to simulate a user.
 */
class Client {
  /**
   * @param {string} username - The username of the client.
   * @param {string} email - The email of the client.
   * @param {string|undefined} category - The category for matching (optional).
   * @param {string} difficulty - The difficulty level for matching.
   */
  constructor(username, email, category, difficulty) {
    this.username = username;
    this.email = email;
    this.category = category;
    this.difficulty = difficulty;
    this.socket = io(SOCKET_SERVER_URL);
    this.socketId = null;
    this.retryInterval = 1000; // 1 second
    this.maxRetries = 5;
    this.attempt = 0;
    this.isMatched = false;

    this.initialize();
  }

  /**
   * Initialize the client by setting up socket event listeners.
   */
  initialize() {
    this.socket.on('connect', async () => {
      this.socketId = this.socket.id;
      console.log(`${this.username} connected with socket ID: ${this.socketId}`);

      // Initial match request
      this.requestMatch();
    });

    this.socket.on('matchFound', (data) => {
      console.log(`${this.username} received match:`, data);
      this.isMatched = true;
      this.socket.disconnect();
    });

    this.socket.on('error', (error) => {
      console.error(`${this.username} Socket error:`, error);
    });

    this.socket.on('disconnect', () => {
      console.log(`${this.username} disconnected`);
    });
  }

  /**
   * Prepare and send a match request to the server.
   */
  async requestMatch() {
    if (this.isMatched) return; // Do not proceed if already matched
    if (this.attempt >= this.maxRetries) {
      console.log(`${this.username} reached maximum match attempts. Stopping.`);
      this.socket.disconnect();
      return;
    }

    this.attempt += 1;
    console.log(`${this.username} attempting match (Attempt ${this.attempt})`);

    const requestData = {
      username: this.username,
      email: this.email,
      socketId: this.socketId,
    };

    if (typeof this.category === 'string' && this.category.trim() !== '') {
      requestData.category = this.category.trim();
    }

    if (typeof this.difficulty === 'string' && this.difficulty.trim() !== '') {
      requestData.difficulty = this.difficulty.trim();
    }

    try {
      const response = await axios.post(API_URL, requestData);
      console.log(`${this.username} REST API response:`, response.data);

      if (response.data.matchingStatus === 'SUCCESS') {
        console.log(`${this.username} has been successfully matched.`);
        this.isMatched = true;
        this.socket.disconnect();
      } else if (response.data.matchingStatus === 'SEARCHING') {
        console.log(`${this.username} is still searching for a match. Retrying in ${this.retryInterval / 1000} seconds...`);
        setTimeout(() => this.requestMatch(), this.retryInterval);
      } else {
        console.error(`${this.username} received an unexpected status:`, response.data);
        this.socket.disconnect();
      }
    } catch (error) {
      if (error.response) {
        console.error(`${this.username} REST API error:`, error.response.status, error.response.data);
      } else if (error.request) {
        console.error(`${this.username} No response received:`, error.request);
      } else {
        console.error(`${this.username} Error in request setup:`, error.message);
      }
      console.log(`${this.username} encountered an error. Retrying in ${this.retryInterval / 1000} seconds...`);
      setTimeout(() => this.requestMatch(), this.retryInterval);
    }
  }
}

/**
 * Function to simulate multiple clients based on your test plan.
 */
function runTests() {
  // 1. Normal Matching: User1 and User2
  const user1 = new Client('User1', 'user1@example.com', 'Bit Manipulation', 'Hard');

  setTimeout(() => {
    const user2 = new Client('User2', 'user2@example.com', 'Bit Manipulation', 'Hard');
  }, 1000); // User2 connects after 1 second

  // 2. Simultaneous Queueing: User3 and User4
  setTimeout(() => {
    const user3 = new Client('User3', 'user3@example.com', 'Arrays', 'Easy');
    const user4 = new Client('User4', 'user4@example.com', 'Arrays', 'Easy');
  }, 2000); // Both connect after 2 seconds

  // 3. In case of async race condition, re-Checking the Queue: User3 re-attempts after 1 second (may not have race condition)

  // 4. Cross-Difficulty and Category Matching: Additional Users5 and Users6
  setTimeout(() => {
    const user5 = new Client('User5', 'user5@example.com', 'Bit Manipulation', 'Easy');
    const user6 = new Client('User6', 'user6@example.com', 'Graphs', 'Hard');
  }, 4000); // Users5 and Users6 connect at 4 seconds

  // 5. Additional Cross-Matching: Users7 and Users8
  setTimeout(() => {
    const user7 = new Client('User7', 'user7@example.com', undefined, 'Medium');
    const user8 = new Client('User8', 'user8@example.com', 'Graphs', undefined);
  }, 5000); // Users7 and Users8 connect at 5 seconds

  /*
  Results:
  1-2, 3-4, 6-8 match
  5-7 retry until they stop.
  */
}

runTests();
