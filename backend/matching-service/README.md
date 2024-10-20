Matching service backend. 

To configure the .env files, create a copy of .env.example and rename it .env. 
If you edited the .env file on the root level, copy and paste it in.

.env variables:
# Database Connection String Details
DATABASE_NAME=peerprepMatchingServiceDB
Should be the same as the root .env file.

# Port to run service on
PORT=3003
Port of the service.

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
Redis uri configurations. Note: The port matters for all forms of deployment, but
editing REDIS_HOST here only affects the local deployment. To affect the name of
the redis uri, edit the docker-compose.yml file instead. This environment variable is
overriden there.

# Matching time periods (In milliseconds)
MATCHING_INTERVAL=1000
The matching worker checks for matches for matches every ^ milliseconds.
RELAXATION_INTERVAL=3000
The matching worker relaxes requirements from users for matching every ^ milliseconds. 
The first time ^ milliseconds passes, the users will be matched with only category considered.
The second time ^ milliseconds passes, the users will be matched with only difficulty considered.
At least one of category or difficulty must match.
MATCH_TIMEOUT=30000
Users will be considered as having timed out if the ^ milliseconds have passed.
CLEANUP_INTERVAL=75000
Stale users will be checked and cleansed every ^ milliseconds by the staleUserCleaner.
