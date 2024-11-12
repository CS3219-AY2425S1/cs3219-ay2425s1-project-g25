using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.Text.Json.Serialization;

namespace Chatio.Models;

public class ShoppingMallModel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("Name")]
    public string Name { get; set; } = null!;

    [BsonElement("Location")]
    public string? Location { get; set; }

    [BsonElement("Vector")]
    [JsonIgnore]
    public List<float> Vector { get; set; } = null!;

    [BsonIgnoreIfNull]
    [BsonElement("Description")]
    public string? Description { get; set; }
}