Yo, this is Kevin/Nephelite and this file is an informal guide into using docker for MongoDB.

Set-up:
1. Install mongoDB (https://www.mongodb.com/docs/manual/installation/) and Docker (https://docs.docker.com/engine/install/)
2. Set up .env files (you can just rename the .env.example to .env). If you make any changes to the .env file in the root such
that it's different from .env.example, copy and paste the root .env into the other .env files in each microservice.
3. Ensure the .env variables match the docker-compose.yml and init-mongo.js files because apparently they can't read the .env files?
4. In the project root folder, run `docker-compose build --no-cache` to build the mongoDB service.
5. Run `docker-compose up -d` to initialize and run the mongoDB service (and everything else).

And everything should work in a bit. Give it a few seconds, maybe a minute at most, and everything should be up.
Note: The green ticks that appear are just for indicating that the start up is successful. 
The databases might not be set up yet, even if the terminal claims everything is set up and running.

Stop running:
1. Run `docker-compose down -v` to stop the services.
2. If you want to do a full complete reset on the databases, delete the data folder with `rm -rf ./data/db`, 
or just delete the data folder in the root directory manually if you despise the `rm -rf` command.

View databases:
1. Verify that you have access to `mongosh`. If you installed the latest mongoDB version, you *should* have it.
2. Run `docker exec -it <mongo container name> mongosh --host <DB host> -u <mongodb root user username> -p <mongodb root user password> --authenticationDatabase admin`. By the project's default values, the command will be `docker exec -it peerprep-mongo-container mongosh --host localhost -u admin -p password --authenticationDatabase admin`.
3. In the mongosh:
    1. View all databases with `show dbs`.
    2. Navigate into a database with `use <databaseName>`. 
    3. View all collections in the database with `show collections`.
    4. Use `db.<collection name>.find().pretty()` to view all entries in the collection.

Another warning about viewing databases: If you immediately try to run `docker exec` after doing `docker-compose up -d`, 
mongoDB will refuse the connection because it's still running setup operations from init-mongo.js. 
Just wait for awhile before running the command again.
