using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Chatio.Models;

public class AssistantModel
{
    [BsonId]
    public string Id { get; set; } = null!;

    [BsonElement("object")]
    public string Object { get; set; } = "assistant";

    [BsonElement("created_at")]
    public long CreatedAt { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public required string Model { get; set; }

    public string? Instructions { get; set; }

    public string? Tools { get; set; }

    public string? Metadata { get; set; }
    public float? Temperature { get; set; }

    [BsonElement("response_format")]
    public string? ResponseFormat { get; set; }
    public static void RegisterClassMap()
    {
        if (!BsonClassMap.IsClassMapRegistered(typeof(AssistantModel)))
        {
            BsonClassMap.RegisterClassMap<AssistantModel>(cm =>
            {
                cm.AutoMap();
                cm.SetIgnoreExtraElements(true); // Ignore extra fields
            });
        }
    }
}

public class Tool
{
    public required string Type { get; set; }
}
