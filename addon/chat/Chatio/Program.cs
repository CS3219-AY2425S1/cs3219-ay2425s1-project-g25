using Chatio.Hubs;
using StackExchange.Redis;
using Chatio.Data.Hub;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = false,
        ValidateIssuerSigningKey = false
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Retrieve token from the query string for SignalR connections
            var accessToken = context.Request.Query["access_token"];
            if (!string.IsNullOrEmpty(accessToken))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", builder =>
    {
        builder
            .WithOrigins("http://localhost:5173") // Add your allowed origins here
            .WithOrigins("http://localhost:3000") // Add your allowed origins here
            .WithOrigins("http://localhost:5000") // Add your allowed origins here
            .WithOrigins("http://localhost:3005") // Add your allowed origins here
            .WithOrigins("http://localhost:7000") // Add your allowed origins here
            .WithOrigins("http://localhost:3005") // Add your allowed origins here
            .WithOrigins("https://talkio-azha.vercel.app") // Add your allowed origins here
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var redisConnectionString = builder.Configuration.GetConnectionString("Redis")
                            ?? builder.Configuration["Redis:ConnectionString"];

// Register Redis as a Singleton
builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnectionString!));
builder.Services.AddSingleton<IHubRepository, HubRepository>();

// Add SignalR services
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 102400; // 100 KB

}).AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;

});
var app = builder.Build();

app.UseCors("AllowSpecificOrigins");

app.UseSwagger();
app.UseSwaggerUI();

//app.UseHttpsRedirection();
app.UseAuthentication();

app.UseAuthorization();
app.UseRouting();

// Map SignalR hubs
app.MapHub<ChatHub>("/hubs/chat");

app.MapControllers();

app.Run();
