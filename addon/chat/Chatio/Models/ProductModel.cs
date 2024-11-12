using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.Text.Json.Serialization;

namespace Chatio.Models
{
    public class ProductModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        [BsonElement("Name")]
        public string Name { get; set; } = null!;

        [BsonElement("Price")]
        public double Price { get; set; }

        [BsonElement("Description")]
        public string? Description { get; set; }

        [BsonElement("Stock")]
        public int Stock { get; set; }

        [BsonElement("Tags")]
        public List<string>? Tags { get; set; }

        [BsonElement("Vector")]
        [JsonIgnore]
        public List<float> Vector { get; set; } = null!;
    }
}
