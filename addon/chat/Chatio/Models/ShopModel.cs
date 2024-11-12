using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Chatio.Models
{
    public class ShopModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        [BsonElement("Name")]
        public string Name { get; set; } = null!;

        [BsonElement("Category")]
        public string? Category { get; set; }

        [BsonElement("Vector")]
        [JsonIgnore]
        public List<float> Vector { get; set; } = null!;

        [BsonIgnoreIfNull]
        [BsonElement("Description")]
        public string? Description { get; set; }

        // Location information object to encapsulate all navigational data
        [BsonElement("LocationInfo")]
        public LocationInfo LocationInfo { get; set; } = null!;
    }

    // Encapsulates all location-related data for navigation
    public class LocationInfo
    {
        [BsonElement("EntryPoint")]
        public double EntryPoint { get; set; } // Entry point direction (360° relative to X-axis)

        [BsonElement("ExitPoint")]
        public double ExitPoint { get; set; } // Exit point direction (360° relative to X-axis)

        [BsonElement("Coordinates")]
        public Coordinate Coordinates { get; set; } = null!;
    }

    // Represents coordinates in the shop's layout
    public class Coordinate
    {
        [BsonElement("X")]
        public double X { get; set; } // X-coordinate of the position

        [BsonElement("Y")]
        public double Y { get; set; } // Y-coordinate of the position

        [BsonElement("Z")]
        public double Z { get; set; } // Z-coordinate representing the level (floor number)
    }
}
