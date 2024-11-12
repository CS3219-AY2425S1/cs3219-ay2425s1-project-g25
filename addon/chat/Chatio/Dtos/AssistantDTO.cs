using Chatio.Models;
using MongoDB.Bson;

namespace Chatio.Dtos;

// AssistantModel DTO with mapping method
public class AssistantDto
{
    public string Id { get; set; } = null!;
    public string Object { get; set; } = "assistant";
    public long CreatedAt { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string Model { get; set; } = null!;
    public string? Instructions { get; set; }
    public string? Tools { get; set; }
    public string? Metadata { get; set; }
    public float? Temperature { get; set; }
    public string? ResponseFormat { get; set; }

    // Mapping from domain model to DTO
    public static AssistantDto FromModel(AssistantModel model)
    {
        return new AssistantDto
        {
            Id = model.Id,
            Object = model.Object,
            CreatedAt = model.CreatedAt,
            Name = model.Name,
            Description = model.Description,
            Model = model.Model,
            Instructions = model.Instructions,
            Tools = model.Tools,
            Metadata = model.Metadata,
            Temperature = model.Temperature,
            ResponseFormat = model.ResponseFormat
        };
    }

    // Optionally add a reverse mapping method if needed
    public AssistantModel ToModel()
    {
        return new AssistantModel
        {
            Id = this.Id,
            Object = this.Object,
            CreatedAt = this.CreatedAt,
            Name = this.Name,
            Description = this.Description,
            Model = this.Model,
            Instructions = this.Instructions,
            Tools = this.Tools,
            Metadata = this.Metadata,
            Temperature = this.Temperature,
            ResponseFormat = this.ResponseFormat
        };
    }
}