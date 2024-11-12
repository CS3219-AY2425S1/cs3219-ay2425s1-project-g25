using Chatio.Models;
using MongoDB.Bson;

namespace Chatio.Dtos
{
public class TextContentDto
{
    public string Value { get; set; } = null!;
    public string? Annotations { get; set; }

    // Mapping from domain model to DTO
    public static TextContentDto FromModel(TextContent model)
    {
        return new TextContentDto
        {
            Value = model.Value,
            Annotations = model.Annotations
        };
    }

    // Optionally add a reverse mapping method if needed
    public TextContent ToModel()
    {
        return new TextContent
        {
            Value = this.Value,
            Annotations = this.Annotations
        };
    }
}
}
