using Chatio.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IHubRepository
{
    // Connection Management
    Task AddConnectionAsync(string connectionId, string userId, string username);
    Task RemoveConnectionAsync(string connectionId, string userId);
    Task<IEnumerable<string>> GetUserConnectionsAsync(string userId);

    // User Management
    Task<UserDetails> GetUserDetailsAsync(string userId);
    Task UpdateUserDetailsAsync(string userId, UserDetails details);

    // Room Management
    Task AddUserToRoomAsync(string roomId, string userId);
    Task RemoveUserFromRoomAsync(string roomId, string userId);
    Task<IEnumerable<string>> GetUsersInRoomAsync(string roomId);
    Task<IEnumerable<string>> GetUserRoomsAsync(string userId);
    Task<RoomInfo> GetRoomInfoAsync(string roomId);
    Task UpdateRoomInfoAsync(string roomId, RoomInfo info);

    // Bulk Operations
    Task<List<UserInfoDto>> GetParticipantsAsync(IEnumerable<string> userIds);

    // Message History
    Task SaveMessageAsync(string roomId, MessageDto message);
    Task<List<MessageDto>> GetMessageHistoryAsync(string roomId, int count = 50);

    // Room Participants
    Task<List<UserInfoDto>> GetRoomParticipantsAsync(string roomId);
    Task<string?> GetUserIdByConnectionAsync(string connectionId);
    Task<IEnumerable<string>> GetConnectionIdsByUserIdAsync(string userId);
}

public class UserDetails
{
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string? Email { get; set; }
}

public class RoomInfo
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Type { get; set; } = null!;  // 'group' | 'direct'
    public DateTime CreatedAt { get; set; }
}