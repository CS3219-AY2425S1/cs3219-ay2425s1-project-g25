-- find_and_remove_match.lua
local requesterSocketId = ARGV[1]
local matchedSocketId = nil

-- Iterate over the queues
for i = 1, #KEYS do
    local queueKey = KEYS[i]
    -- Remove the requester from the queue (if present)
    redis.call('LREM', queueKey, 0, requesterSocketId)
    -- Attempt to find another user in the queue
    local queueLength = redis.call('LLEN', queueKey)
    if queueLength > 0 then
        matchedSocketId = redis.call('LINDEX', queueKey, 0)
        if matchedSocketId and matchedSocketId ~= requesterSocketId then
            -- Remove the matched user from all queues
            for j = 1, #KEYS do
                redis.call('LREM', KEYS[j], 0, matchedSocketId)
            end
            -- Remove the requester from all queues (in case they are still there)
            for j = 1, #KEYS do
                redis.call('LREM', KEYS[j], 0, requesterSocketId)
            end
            break
        end
    end
end

if matchedSocketId then
    return matchedSocketId
else
    -- No match found; do not add the requester to the queues here
    return nil
end
