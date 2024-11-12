using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace Chatio.Models;

public class ThreadModel
{
    [BsonId]
    public string Id { get; set; } = null!;

    [BsonElement("object")]
    public string Object { get; set; } = "thread";

    [BsonElement("created_at")]
    public long CreatedAt { get; set; }

    public BsonDocument? Metadata { get; set; }

    [BsonElement("tool_resources")]
    public BsonDocument? ToolResources { get; set; }  // Updated to BsonDocument

}
