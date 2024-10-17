const io = require('socket.io-client');

// Global counters for active clients and completed test cases
let activeClients = 0;
let completedTestCases = 0;
const totalTestCases = 16;
let testCaseQueue = [];

/**
 * Client class to simulate a user.
 * 
 * If ENABLE_RELAXATION is true:
 * - Users will be relaxed on matching criteria (e.g., after certain attempts, matching becomes less strict).
 * 
 * If ENABLE_RELAXATION is false:
 * - Users must match on both category and difficulty strictly, no relaxation.
 */
class Client {
  constructor(username, email, category, difficulty, maxRetries, testCase, autoCancel = false, autoDisconnect = false) {
    activeClients++;

    this.username = username;
    this.email = email;
    this.category = category;
    this.difficulty = difficulty;
    this.socket = io('http://localhost:3003');
    this.isMatched = false;
    this.retryInterval = 2000;
    this.maxRetries = maxRetries;
    this.attempt = 0;
    this.testCase = testCase;
    this.autoCancel = autoCancel;
    this.autoDisconnect = autoDisconnect;

    this.initialize();
  }

  initialize() {
    this.socket.on('connect', () => {
      console.log(`[Test Case ${this.testCase}] ${this.username} connected with socket ID: ${this.socket.id}`);

      this.requestMatch();

      if (this.autoCancel) {
        const cancelDelay = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
          if (!this.isMatched) {
            console.log(`[Test Case ${this.testCase}] ${this.username} is canceling the match request.`);
            this.cancelMatch();
          }
        }, cancelDelay);
      }

      if (this.autoDisconnect) {
        const disconnectDelay = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
          if (!this.isMatched) {
            console.log(`[Test Case ${this.testCase}] ${this.username} is disconnecting unexpectedly.`);
            this.socket.disconnect();
          }
        }, disconnectDelay);
      }
    });

    this.socket.on('matchFound', (data) => {
      console.log(`[Test Case ${this.testCase}] ${this.username} received match:`, data);
      this.isMatched = true;

      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }

      setTimeout(() => {
        this.socket.disconnect();
      }, 1000);
    });

    this.socket.on('cancelMatching', (data) => {
      console.log(`[Test Case ${this.testCase}] ${this.username} match canceled:`, data);

      setTimeout(() => {
        this.socket.disconnect();
      }, 1000);
    });

    this.socket.on('error', (error) => {
      console.error(`[Test Case ${this.testCase}] ${this.username} Socket error:`, error);

      this.socket.disconnect();
    });

    this.socket.on('disconnect', () => {
      console.log(`[Test Case ${this.testCase}] ${this.username} disconnected`);
      activeClients--;

      checkTestCompletion(this.testCase);
    });
  }

  requestMatch() {
    if (this.isMatched) return;
    if (this.attempt >= this.maxRetries) {
      console.log(`[Test Case ${this.testCase}] ${this.username} reached maximum match attempts. Stopping.`);
      this.cancelMatch();
      return;
    }

    this.attempt += 1;
    console.log(`[Test Case ${this.testCase}] ${this.username} attempting match (Attempt ${this.attempt})`);

    const requestData = {
      username: this.username,
      email: this.email,
      category: this.category,
      difficulty: this.difficulty,
    };

    this.socket.emit('startMatching', requestData);

    this.retryTimeout = setTimeout(() => {
      if (!this.isMatched) {
        console.log(`[Test Case ${this.testCase}] ${this.username} is still searching for a match. Retrying...`);
        this.requestMatch();
      }
    }, this.retryInterval);
  }

  cancelMatch() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    this.socket.emit('cancelMatching');

    setTimeout(() => {
      this.socket.disconnect();
    }, 1000);
  }
}

function checkTestCompletion(testCase) {
  if (activeClients === 0) {
    completedTestCases++;
    console.log(`All clients for Test Case ${testCase} have disconnected.`);

    if (testCaseQueue.length > 0) {
      const nextTestCase = testCaseQueue.shift();
      nextTestCase();
    } else if (completedTestCases === totalTestCases) {
      console.log('All test cases have been completed. Exiting program.');
      process.exit(0);
    }
  }
}

function addTestCasesToQueue() {
  // Test Case 1: Immediate Matching with same category and difficulty
  testCaseQueue.push(() => {
    console.log('--- Test Case 1: Immediate Matching ---');
    const user1 = new Client('User1_TC1', 'user1_tc1@example.com', 'Arrays', 'Easy', 5, 1);
    setTimeout(() => {
      const user2 = new Client('User2_TC1', 'user2_tc1@example.com', 'Arrays', 'Easy', 5, 1);
    }, 1000); // User2 connects after 1 second
    // If ENABLE_RELAXATION is true or false: Both users should match immediately.
  });

  // Test Case 2: Matching on 3rd attempt (category only)
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 2: Matching on 3rd Attempt (Category Only) ---');
    const user3 = new Client('User3_TC2', 'user3_tc2@example.com', 'Graphs', 'Medium', 5, 2);
    const user4 = new Client('User4_TC2', 'user4_tc2@example.com', 'Graphs', 'Hard', 5, 2);
    // If ENABLE_RELAXATION is true: Users will match after relaxing difficulty.
    // If ENABLE_RELAXATION is false: The test will fail due to difficulty mismatch.
  });

  // Test Case 3: Matching on 5th attempt (difficulty only)
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 3: Matching on 5th Attempt (Difficulty Only) ---');
    const user5 = new Client('User5_TC3', 'user5_tc3@example.com', 'Trees', 'Hard', 8, 3);
    const user6 = new Client('User6_TC3', 'user6_tc3@example.com', 'Graphs', 'Hard', 8, 3);
    // If ENABLE_RELAXATION is true: They will match after relaxing category.
    // If ENABLE_RELAXATION is false: The test will fail due to category mismatch.
  });

  // Test Case 4: No Matching even after criteria relaxation
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 4: No Match Found ---');
    const user7 = new Client('User7_TC4', 'user7_tc4@example.com', 'Dynamic Programming', 'Easy', 5, 4);
    const user8 = new Client('User8_TC4', 'user8_tc4@example.com', 'Graphs', 'Hard', 5, 4);
    // If ENABLE_RELAXATION is true or false: No match due to different criteria.
  });

  // Test Case 5: Race Condition - Multiple users attempting to match simultaneously
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 5: Race Condition ---');
    const users = [];
    for (let i = 1; i <= 5; i++) {
      users.push(new Client(`User_TC5_${i}`, `user_tc5_${i}@example.com`, 'Sorting', 'Medium', 5, 5));
    }
    // If ENABLE_RELAXATION is true or false: Users should match due to same criteria.
  });

  // Test Case 6: Delayed Connection
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 6: Delayed Connection ---');
    const user9 = new Client('User9_TC6', 'user9_tc6@example.com', 'Greedy', 'Hard', 5, 6);
    setTimeout(() => {
      const user10 = new Client('User10_TC6', 'user10_tc6@example.com', 'Greedy', 'Hard', 5, 6);
    }, 5000);
    // If ENABLE_RELAXATION is true or false: Both should match based on identical criteria.
  });

  // Test Case 7: User Cancels Match Request Midway
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 7: User Cancels Match Request Midway ---');
    const user11 = new Client('User11_TC7', 'user11_tc7@example.com', 'Backtracking', 'Medium', 5, 7, true);
    const user12 = new Client('User12_TC7', 'user12_tc7@example.com', 'Backtracking', 'Medium', 5, 7);
    // If ENABLE_RELAXATION is true or false: One user cancels, no match will occur.
  });

  // Test Case 8: User Disconnects Unexpectedly
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 8: User Disconnects Unexpectedly ---');
    const user13 = new Client('User13_TC8', 'user13_tc8@example.com', 'Dynamic Programming', 'Hard', 5, 8, false, true);
    const user14 = new Client('User14_TC8', 'user14_tc8@example.com', 'Dynamic Programming', 'Hard', 5, 8);
    // If ENABLE_RELAXATION is true or false: User13 will disconnect, no match will happen.
  });

  // Test Case 9: Users with Empty Criteria
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 9: Users with Empty Criteria ---');
    const user15 = new Client('User15_TC9', 'user15_tc9@example.com', '', '', 5, 9);
    const user16 = new Client('User16_TC9', 'user16_tc9@example.com', '', '', 5, 9);
    // If ENABLE_RELAXATION is true or false: Both users will match since they have no criteria.
  });

  // Test Case 10: High Volume of Users
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 10: High Volume of Users ---');
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const category = i % 2 === 0 ? 'Strings' : 'Math';
      const difficulty = i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Medium' : 'Hard';
      users.push(new Client(`User_TC10_${i}`, `user_tc10_${i}@example.com`, category, difficulty, 5, 10));
    }
    // If ENABLE_RELAXATION is true: Many users will match as criteria relaxes.
    // If ENABLE_RELAXATION is false: Only users with matching category and difficulty will match.
  });

  // Test Case 11: One user in relaxed state, the other strict (should not match)
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 11: One Relaxed, One Strict ---');
    const user17 = new Client('User17_TC11', 'user17_tc11@example.com', 'Graphs', 'Medium', 6, 11);
    setTimeout(() => {
      const user18 = new Client('User18_TC11', 'user18_tc11@example.com', 'Graphs', 'Hard', 6, 11);
    }, 8000);
    // If ENABLE_RELAXATION is true: Matching should fail because user 18 is not relaxed at all.
  });

  // Test Case 12: Both users in relaxed state (should match)
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 12: Both Relaxed ---');
    const user19 = new Client('User19_TC12', 'user19_tc12@example.com', 'Graphs', 'Hard', 12, 12);
    setTimeout(() => {
      const user20 = new Client('User20_TC12', 'user20_tc12@example.com', 'Graphs', 'Medium', 7, 12);
    }, 8000);
    // If ENABLE_RELAXATION is true: Both users are eventually in relaxed state, so they should match.
  });

  // Test Case 13: One user with max attempts reached, other just starting
  testCaseQueue.push(() => {
    console.log('\n--- Test Case 13: One Maxed Out, One Starting ---');
    const user21 = new Client('User21_TC13', 'user21_tc13@example.com', 'Trees', 'Hard', 7, 13);
    setTimeout(() => {
      const user22 = new Client('User22_TC13', 'user22_tc13@example.com', '', 'Hard', 5, 13);
    }, 8000);
    // If ENABLE_RELAXATION is true: Tests if users with max attempts match correctly with a new user that doesn't care about category.
  });
}

function runTestsSequentially() {
  addTestCasesToQueue();
  if (testCaseQueue.length > 0) {
    const firstTestCase = testCaseQueue.shift();
    firstTestCase();
  }
}

runTestsSequentially();
