using Chatio.Models;

namespace Chatio.Dtos;

public class MessageContentItemDto
{
    public string Type { get; set; } = null!;
    public TextContentDto Text { get; set; } = null!;

    // Mapping from domain model to DTO
    public static MessageContentItemDto FromModel(MessageContentItem model)
    {
        return new MessageContentItemDto
        {
            Type = model.Type,
            Text = TextContentDto.FromModel(model.Text)
        };
    }

    // Optionally add a reverse mapping method if needed
    public MessageContentItem ToModel()
    {
        return new MessageContentItem
        {
            Type = this.Type,
            Text = this.Text.ToModel()
        };
    }
}
