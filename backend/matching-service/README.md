Hey, this is Nephelite again. 

This service can be accessed both via REST API routes, and purely through websockets (via socket.Io). If you use REST, you must also send the client's socketId, so you need to retrieve it on the frontend first. If you are communicating purely via websockets, then you just need to send { username, email, category, difficulty } along with the event name of `startMatching`.

To test the local implementation of this service without frontend, follow the steps below:

1. Run `npm install` at this level (root of matching-service).
2. Configure the .env file. Edit the `DB_REQUIRE_AUTH` field in .env to be false for local.
3. If the `ENABLE_LOGGING` .env variable is set to true, successful match events will be recorded in MongoDB, under the Database `peerprepMatchingServiceDB` and `matchingevents` collection.
4. Open 2 terminals: One to run the service, the other to run the test script.
5. On either terminal: Open Docker, then run `docker pull redis:latest`, then `docker run --name redis-local -p 6379:6379 -d redis`.
6. First terminal: Run `npm run dev`. Wait for the messages that the server is running and that it has successfully connected to MongoDB.
7. Second terminal: Run `node testClientREST` or `node testClientEvent` and watch the tests go. The former uses the API calls, the latter uses exclusively the socket.io communication.

To add test cases, add them at the bottom of the testClient.js file.

The testClient.js file also allows you to define delay as you wish, so you can use that to test your race condition prevention delay measures, though I also tried to ensure the implementation of matching here avoids race conditions as much as possible.