using Games.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    builder.WithOrigins("http://peabody28.com:5092")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});

var app = builder.Build();

app.UseRouting();
app.UseCors();
app.UseAuthorization();

app.UseEndpoints(configure: endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<TicTacToeHub>("/ticTacToeHub");
    endpoints.MapHub<BattleshipHub>("/battleshipHub");
});

app.Run();
