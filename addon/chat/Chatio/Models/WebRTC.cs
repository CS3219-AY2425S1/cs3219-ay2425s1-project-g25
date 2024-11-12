namespace Chatio.Models.WebRTC;

public class RTCSessionDescription
{
    public string Type { get; set; } = default!;
    public object Sdp { get; set; } = default!;
}



public class RTCIceCandidate
{
    public string? Candidate { get; set; }
    public string? SdpMid { get; set; }
    public int? SdpMLineIndex { get; set; }
    public string? UsernameFragment { get; set; }
}