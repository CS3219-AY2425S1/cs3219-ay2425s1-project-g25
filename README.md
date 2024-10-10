# CS3219 Project (PeerPrep) - AY2425S1
## Group: G25

### Overview
This project follows a microservices architecture with the following services:
1. **Frontend** - Port `3000`
2. **User Service** - Port `3001`
3. **Question Service** - Port `3002`
4. **MongoDB** - Port `27017` (Database)
5. **Nginx API Gateway** - Port `80`

### Running the Project

To run all services, execute the following command in the root directory:

`docker-compose up --build`

Once the containers are up:
- Frontend: [http://localhost:3000](http://localhost:3000)
- User Service: [http://localhost:3001](http://localhost:3001)
- Question Service: [http://localhost:3002](http://localhost:3002)
- MongoDB: [http://localhost:27017](http://localhost:27017)
- Nginx API Gateway: [http://localhost:80](http://localhost:80)

### MongoDB Configuration

- MongoDB runs on port `27017` inside a container named `peerprep-mongo-container`.
- It is initialized with:
  - **Username**: `admin`
  - **Password**: `password`
- Data is persisted in the `./data/db` directory, and the `init-mongo.js` script initializes the database on startup.

### Nginx API Gateway

- Nginx runs on port `80` and acts as the API gateway for routing requests to the respective services.
