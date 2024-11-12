using StackExchange.Redis;
using System.Text.Json;
using Chatio.Dtos;

namespace Chatio.Data.Hub;

public class HubRepository : IHubRepository
{
    private readonly IDatabase _database;
    private const string UserConnectionsKey = "user_connections";
    private const string UserDetailsKey = "user_details";
    private const string RoomKey = "room";
    private const string RoomInfoKey = "room_info";
    private const string UserRoomsKey = "user_rooms";

    public HubRepository(IConnectionMultiplexer redis)
    {
        _database = redis.GetDatabase();
    }

    // Connection Management
    public async Task AddConnectionAsync(string connectionId, string userId, string username)
    {
        await _database.SetAddAsync($"{UserConnectionsKey}:{userId}", connectionId);

        // Save user details with username
        var userDetails = new UserDetails
        {
            Id = userId,
            Username = username
        };
        await UpdateUserDetailsAsync(userId, userDetails);
    }


    public async Task RemoveConnectionAsync(string connectionId, string userId)
    {
        await _database.SetRemoveAsync($"{UserConnectionsKey}:{userId}", connectionId);

        // Clean up if no more connections exist
        if (!(await _database.SetLengthAsync($"{UserConnectionsKey}:{userId}") > 0))
        {
            await _database.KeyDeleteAsync($"{UserConnectionsKey}:{userId}");
            // Don't remove user details as they might be needed later
        }
    }

    public async Task<IEnumerable<string>> GetUserConnectionsAsync(string userId)
    {
        var connections = await _database.SetMembersAsync($"{UserConnectionsKey}:{userId}");
        return connections.Select(c => c.ToString());
    }

    // User Management
    public async Task<UserDetails> GetUserDetailsAsync(string userId)
    {
        var userDetailsJson = await _database.StringGetAsync($"{UserDetailsKey}:{userId}");
        if (userDetailsJson.IsNull)
        {
            return new UserDetails
            {
                Id = userId,
                Username = $"User_{userId.Substring(0, 6)}" // Default if username not found
            };
        }
        return JsonSerializer.Deserialize<UserDetails>(userDetailsJson.ToString())!;
    }


    public async Task UpdateUserDetailsAsync(string userId, UserDetails details)
    {
        var json = JsonSerializer.Serialize(details);
        await _database.StringSetAsync($"{UserDetailsKey}:{userId}", json);
    }

    // Room Management
    public async Task AddUserToRoomAsync(string roomId, string userId)
    {
        await _database.SetAddAsync($"{RoomKey}:{roomId}", userId);
        await _database.SetAddAsync($"{UserRoomsKey}:{userId}", roomId);
    }

    public async Task RemoveUserFromRoomAsync(string roomId, string userId)
    {
        await _database.SetRemoveAsync($"{RoomKey}:{roomId}", userId);
        await _database.SetRemoveAsync($"{UserRoomsKey}:{userId}", roomId);

        // Clean up empty room
        if (!(await _database.SetLengthAsync($"{RoomKey}:{roomId}") > 0))
        {
            await _database.KeyDeleteAsync($"{RoomKey}:{roomId}");
            await _database.KeyDeleteAsync($"{RoomInfoKey}:{roomId}");
        }
    }

    public async Task<IEnumerable<string>> GetUsersInRoomAsync(string roomId)
    {
        var userIds = await _database.SetMembersAsync($"{RoomKey}:{roomId}");
        return userIds.Select(u => u.ToString());
    }

    public async Task<IEnumerable<string>> GetUserRoomsAsync(string userId)
    {
        var roomIds = await _database.SetMembersAsync($"{UserRoomsKey}:{userId}");
        return roomIds.Select(r => r.ToString());
    }

    public async Task<RoomInfo> GetRoomInfoAsync(string roomId)
    {
        var roomInfoJson = await _database.StringGetAsync($"{RoomInfoKey}:{roomId}");
        if (roomInfoJson.IsNull)
        {
            // Return default room info if not found
            return new RoomInfo
            {
                Id = roomId,
                Name = $"Room_{roomId}",
                Type = "group",
                CreatedAt = DateTime.UtcNow
            };
        }
        return JsonSerializer.Deserialize<RoomInfo>(roomInfoJson.ToString())!;
    }

    public async Task UpdateRoomInfoAsync(string roomId, RoomInfo info)
    {
        var json = JsonSerializer.Serialize(info);
        await _database.StringSetAsync($"{RoomInfoKey}:{roomId}", json);
    }

    // Helper methods for bulk operations
    public async Task<List<UserInfoDto>> GetParticipantsAsync(IEnumerable<string> userIds)
    {
        var participants = new List<UserInfoDto>();
        foreach (var userId in userIds)
        {
            var details = await GetUserDetailsAsync(userId);
            participants.Add(new UserInfoDto
            {
                Id = userId,
                Username = details.Username
            });
        }
        return participants;
    }
    public async Task<List<UserInfoDto>> GetRoomParticipantsAsync(string roomId)
    {
        // Get user IDs in the room
        var userIds = await GetUsersInRoomAsync(roomId);

        // Get participant details for each user ID
        return await GetParticipantsAsync(userIds);
    }

    // Optional: Methods for handling message history
    public async Task SaveMessageAsync(string roomId, MessageDto message)
    {
        var messageJson = JsonSerializer.Serialize(message);
        await _database.ListRightPushAsync($"messages:{roomId}", messageJson);
        // Optionally trim the list to maintain a maximum history
        await _database.ListTrimAsync($"messages:{roomId}", 0, 99); // Keep last 100 messages
    }

    public async Task<List<MessageDto>> GetMessageHistoryAsync(string roomId, int count = 50)
    {
        var messages = await _database.ListRangeAsync($"messages:{roomId}", -count, -1);
        return messages
            .Select(m => JsonSerializer.Deserialize<MessageDto>(m.ToString())!)
            .ToList();
    }

    public async Task<string?> GetUserIdByConnectionAsync(string connectionId)
    {
        var server = _database.Multiplexer.GetServer(_database.Multiplexer.GetEndPoints().First());

        foreach (var key in server.Keys(pattern: $"{UserConnectionsKey}:*"))
        {
            if (await _database.SetContainsAsync(key, connectionId))
            {
                return key.ToString().Split(':').Last(); // Extract userId from the key
            }
        }

        return null;
    }

    public async Task<IEnumerable<string>> GetConnectionIdsByUserIdAsync(string userId)
    {
        var connections = await _database.SetMembersAsync($"{UserConnectionsKey}:{userId}");
        return connections.Select(c => c.ToString());
    }

}