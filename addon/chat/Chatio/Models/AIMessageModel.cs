using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace Chatio.Models
{
    public class AIMessageModel
    {
        [BsonId]
        public string? Id { get; set; } // e.g., "msg_abc123"

        [BsonElement("object")]
        public string Object { get; set; } = "thread.message";

        [BsonElement("created_at")]
        public long CreatedAt { get; set; }

        [BsonElement("assistant_id")]
        public string? AssistantId { get; set; }

        [BsonElement("thread_id")]
        public string? ThreadId { get; set; }

        [BsonElement("run_id")]
        public string? RunId { get; set; }

        public string? Role { get; set; } // "user" or "assistant"

        public List<MessageContentItem>? Content { get; set; }

        public string? Attachments { get; set; }

        public string? Metadata { get; set; }
    }

    public class MessageContentItem
    {
        public required string Type { get; set; }

        public required TextContent Text { get; set; }
    }

    public class TextContent
    {
        [BsonElement("value")]
        public required string Value { get; set; }

        public string? Annotations { get; set; }
    }
}
