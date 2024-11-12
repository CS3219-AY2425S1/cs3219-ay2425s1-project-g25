using System.Text.Json.Serialization;

namespace Chatio.Dtos;


public class MessageDto
{
    public string Id { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string Sender { get; set; } = null!;
    public string SenderId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string Datetime { get; set; } = null!;
}

public class UserInfoDto
{
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
}

public class GroupReceiverDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    [JsonPropertyName("type")]
    public string Type { get; set; } = "group";
    public List<UserInfoDto> Members { get; set; } = new();
}

public class RoomInfoDto
{
    public string RoomId { get; set; } = null!;
    public string Type { get; set; } = null!;  // 'group' | 'direct'
}

// Request/Response DTOs
public class JoinRoomRequestDto
{
    public string RoomId { get; set; } = null!;
}

public class LeaveRoomRequestDto
{
    public string RoomId { get; set; } = null!;
}

public class SendMessageRequestDto
{
    public string RoomId { get; set; } = null!;
    public MessageDto Message { get; set; } = null!;
}

public class RoomMembersResponseDto
{
    public string RoomId { get; set; } = null!;
    public List<UserInfoDto> Members { get; set; } = new();
}
