# CS3219 Project (PeerPrep) - AY2425S1
## Group: G25

### Overview
This project follows a microservices architecture with the following services:
1. **Frontend** - Port `3000`
2. **User Service** - Port `3001`
3. **Question Service** - Port `3002` 
4. **Matching Service** - Port `3003`
5. **Collaboration Service** - Port `3004`
6. **MongoDB** - Port `27017` (Database)
7. **Nginx API Gateway** - Port `80`
8. **Redis** - Port `6379`
9. **Zookeeper** - Port `2181`
10. **Kafka** - Port `9092`, Port `29092`
11. **Chat Service** (Located in addon/chat)

### Setting up the Project

### Running the Project with `start.sh`

A `start.sh` script is provided in the root directory to simplify setup. This script will start all services, check for any `.env.example` files, and create the required `.env` files if they don’t already exist.

To run the project, open a terminal in the `cs3219-ay2425s1-project-g25` directory and execute:

    ./start.sh

This script can be run on **Linux**, **macOS**, and **Windows** (with Git Bash or WSL). It will initialize all services and ensure the environment files are set up as needed. 

Ensure the script has execute permissions. If needed, set them by running:

    chmod +x start.sh


This will initialize all services and ensure the environment files are set up as needed. Note that running `start.sh` requires Git Bash, WSL, or a similar terminal environment capable of executing Bash scripts.

### Manual Setup
Copy and paste the .env.example files in each service. Rename them as .env files.
Files to do this in:
1. ./
2. /frontend
3. /backend/user-service
4. /backend/question-service
5. /backend/matching-service
6. /backend/collaboration-service

Then, run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` twice to generate
your 2 JWT token secrets. For the first one, paste it into the JWT_ACCESS_TOKEN_SECRET variable of
the .env files in question-service and user-service. Then, copy the second into the
JWT_REFRESH_TOKEN_SECRET of the .env file in user-service. 

Further note: The DB_CLOUD_URI .env variable in user-service doesn't need to be filled in. A local
database will be created in the mongoDB service. 

Consult the readme files in each service if there are further configurations needed.

### Running the Project

To run the main services, execute the following command in the root directory:

`docker-compose up --build`

To run the chat service, navigate to the addon/chat directory and run:

`docker-compose up --build`

Once the containers are up:
- Frontend: [http://localhost:3000](http://localhost:3000)
- User Service: [http://localhost:3001](http://localhost:3001)
- Question Service: [http://localhost:3002](http://localhost:3002)
- Matching Service: [http://localhost:3003](http://localhost:3003)
- Collaboration Service: [http://localhost:3004](http://localhost:3004)
- MongoDB: [http://localhost:27017](http://localhost:27017)
- Nginx API Gateway: [http://localhost:80](http://localhost:80)
- Redis: [http://localhost:6379](http://localhost:6379)
- Zookeeper: [http://localhost:2181](http://localhost:2181)
- Kafka: [http://localhost:9092](http://localhost:9092)
- Chat Service: Available through the main application

Note that even after docker says that everything is up and running, there is a risk that they aren't when you load the frontend. Wait for the frontend logs to show up in the docker logs.
In this event, wait for about a minute before trying again. If that still doesn't work and there are network errors, try
rebuilding the services by running `docker-compose up --build` again.

### MongoDB Configuration

- MongoDB runs on port `27017` inside a container named `peerprep-mongo-container`.
- It is initialized with:
  - **Username**: `admin`
  - **Password**: `password`
- Data is persisted in the `./data/db` directory, and the `init-mongo.js` script initializes the database on startup.

### Nginx API Gateway

- Nginx runs on port `80` and acts as the API gateway for routing requests to the respective services.

### Kubernetes Auto Pod Scaling

All files for Kubernetes deployment and auto scaling of services can be found in the `/kubernetes/` folder.

Refer to the [README](/kubernetes/README.md) in the kubernetes folder for more information.
