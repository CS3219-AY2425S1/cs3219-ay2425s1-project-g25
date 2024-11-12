namespace Chatio.Configurations;

public class OpenAiSettings
{
    public required string ApiKey { get; set; }
    public required string DefaultChatModel { get; set; }
    public required string DefaultEmbeddingModel { get; set; }
    public double DefaultTemperature { get; set; }
    public double DefaultTopP { get; set; }
    public double DefaultFrequencyPenalty { get; set; }
    public double DefaultPresencePenalty { get; set; }
    public int DefaultMaxTokens { get; set; }
}
