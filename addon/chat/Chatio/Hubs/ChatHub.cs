using Microsoft.AspNetCore.SignalR;
using System.IdentityModel.Tokens.Jwt;
using Chatio.Dtos;
using Chatio.Models.WebRTC;

namespace Chatio.Hubs;

public class ChatHub : Hub
{
    private readonly IHubRepository _hubRepository;

    public ChatHub(IHubRepository hubRepository)
    {
        _hubRepository = hubRepository;
    }

    public override async Task OnConnectedAsync()
    {
        var accessToken = Context.GetHttpContext()?.Request.Query["access_token"].FirstOrDefault();
        if (!string.IsNullOrEmpty(accessToken))
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(accessToken) as JwtSecurityToken;
            var userId = jsonToken?.Claims.FirstOrDefault(c => c.Type == "id")?.Value ?? Guid.NewGuid().ToString();
            var userName = jsonToken?.Claims.FirstOrDefault(c => c.Type == "username")?.Value ?? "Anonymous";

            await _hubRepository.AddConnectionAsync(Context.ConnectionId, userId, userName);
            await base.OnConnectedAsync();
        }
        else
        {
            await base.OnConnectedAsync();
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;
        var userId = await _hubRepository.GetUserIdByConnectionAsync(connectionId);
        if (userId == null)
        {
            await base.OnDisconnectedAsync(exception);
            return;
        }

        await _hubRepository.RemoveConnectionAsync(connectionId, userId);
        var userRooms = await _hubRepository.GetUserRoomsAsync(userId);
        var participant = await _hubRepository.GetUserDetailsAsync(userId);

        foreach (var room in userRooms)
        {
            await _hubRepository.RemoveUserFromRoomAsync(room, userId);
            var updatedMembers = await _hubRepository.GetRoomParticipantsAsync(room);
            await Clients.Group(room).SendAsync("UserLeft", participant.Username, room);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinRoom(JoinRoomRequestDto request)
    {
        var connectionId = Context.ConnectionId;
        var userId = await _hubRepository.GetUserIdByConnectionAsync(connectionId);
        if (userId == null) return;

        await _hubRepository.AddUserToRoomAsync(request.RoomId, userId);
        var roomMembers = await _hubRepository.GetRoomParticipantsAsync(request.RoomId);
        var participant = await _hubRepository.GetUserDetailsAsync(userId);

        await Groups.AddToGroupAsync(connectionId, request.RoomId);
        await Clients.Caller.SendAsync("RoomMembers", roomMembers);

        var userInfoDto = new UserInfoDto
        {
            Id = participant.Id,
            Username = participant.Username
        };
        await Clients.Group(request.RoomId).SendAsync("UserJoined", userInfoDto, request.RoomId);
    }

    public async Task LeaveRoom(LeaveRoomRequestDto request)
    {
        var connectionId = Context.ConnectionId;
        var userId = await _hubRepository.GetUserIdByConnectionAsync(connectionId);
        if (userId == null) return;

        await _hubRepository.RemoveUserFromRoomAsync(request.RoomId, userId);
        var updatedRoomMembers = await _hubRepository.GetRoomParticipantsAsync(request.RoomId);
        var participant = await _hubRepository.GetUserDetailsAsync(userId);

        await Groups.RemoveFromGroupAsync(connectionId, request.RoomId);
        await Clients.Group(request.RoomId).SendAsync("RoomMembers", updatedRoomMembers);

        var userInfoDto = new UserInfoDto
        {
            Id = participant.Id,
            Username = participant.Username
        };
        await Clients.Group(request.RoomId).SendAsync("UserLeft", userInfoDto, request.RoomId);
    }

    public async Task SendMessageToRoom(SendMessageRequestDto request)
    {
        var connectionId = Context.ConnectionId;
        var userId = await _hubRepository.GetUserIdByConnectionAsync(connectionId);
        if (userId == null) return;

        var participant = await _hubRepository.GetUserDetailsAsync(userId);
        request.Message.Sender = participant.Username;
        request.Message.Datetime = DateTime.UtcNow.ToString("o");
        request.Message.SenderId = userId;

        await _hubRepository.SaveMessageAsync(request.RoomId, request.Message);
        await Clients.Group(request.RoomId).SendAsync("ReceiveMessage", request.Message);
    }


    public async Task SendOffer(string targetUserId, RTCSessionDescription offer)
    {
        var targetConnectionIds = await _hubRepository.GetConnectionIdsByUserIdAsync(targetUserId);
        var connectionId = Context.ConnectionId;
        var userId = await _hubRepository.GetUserIdByConnectionAsync(connectionId);
        foreach (var targetConnectionId in targetConnectionIds)
        {
            await Clients.Client(targetConnectionId).SendAsync("ReceiveOffer",userId, offer);
        }
    }

    public async Task SendAnswer(string targetUserId, RTCSessionDescription answer)
    {
        var targetConnectionIds = await _hubRepository.GetConnectionIdsByUserIdAsync(targetUserId);
        var connectionId = Context.ConnectionId;
        var userId = await _hubRepository.GetUserIdByConnectionAsync(connectionId);
        foreach (var targetConnectionId in targetConnectionIds)
        {
            await Clients.Client(targetConnectionId).SendAsync("ReceiveAnswer", userId, answer);
        }
    }

    public async Task SendIceCandidate(string targetUserId, RTCIceCandidate candidate)
    {
        var targetConnectionIds = await _hubRepository.GetConnectionIdsByUserIdAsync(targetUserId);
        var connectionId = Context.ConnectionId;
        var userId = await _hubRepository.GetUserIdByConnectionAsync(connectionId);
        foreach (var targetConnectionId in targetConnectionIds)
        {
            await Clients.Client(targetConnectionId).SendAsync("ReceiveIceCandidate", userId, candidate);
        }
    }

}