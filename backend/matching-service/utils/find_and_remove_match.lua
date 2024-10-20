-- KEYS[1]: The queue key where users are stored (e.g., 'queue:category:difficulty')
-- ARGV[1]: The socket ID of the user requesting a match

local queueKey = KEYS[1]
local requestingSocketId = ARGV[1]

-- Check if the requesting user is still in the queue
local userIndex = redis.call('LPOS', queueKey, requestingSocketId)
if not userIndex then
    -- User is not in the queue anymore
    return nil
end

-- Try to find another user in the queue to match with
-- We'll look for any other user in the queue

-- Get all users in the queue
local allUsers = redis.call('LRANGE', queueKey, 0, -1)

for i, socketId in ipairs(allUsers) do
    if socketId ~= requestingSocketId then
        -- Found a match, remove both users from the queue
        redis.call('LREM', queueKey, 0, requestingSocketId)
        redis.call('LREM', queueKey, 0, socketId)
        -- Return the matched socket ID
        return socketId
    end
end

-- No match found
return nil
