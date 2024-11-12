using Chatio.Models;

namespace Chatio.Dtos;

public class AIMessageDTO(AIMessageModel model)
{
    public string Id { get; set; } = model.Id!;
    public string Role { get; set; } = model.Role ?? "unknown";
    public string Content { get; set; } = model.Content?.Count > 0 ? model.Content[0].Text.Value : string.Empty;
    public DateTime Datetime { get; set; } = DateTimeOffset.FromUnixTimeSeconds(model.CreatedAt).UtcDateTime;

    // Static method for conversion
    public static AIMessageDTO FromModel(AIMessageModel model)
    {
        return new AIMessageDTO(model);
    }
}
