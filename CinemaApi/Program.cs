using CinemaApi.Data;
using CinemaTicketSystem.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString(
            "DefaultConnection")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply the committed migrations to a fresh local database.
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();

    // Optional local-demo bootstrap. Supply credentials outside source control.
    var username = builder.Configuration["BootstrapAdmin:Username"];
    var password = builder.Configuration["BootstrapAdmin:Password"];
    if (!context.Users.Any() && !string.IsNullOrWhiteSpace(username)
        && !string.IsNullOrWhiteSpace(password))
    {
        context.Users.Add(new User { Username = username, Password = password,
            FirstName = "Demo", LastName = "Administrator", Role = "Admin" });
        context.SaveChanges();
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("ReactApp");

app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();