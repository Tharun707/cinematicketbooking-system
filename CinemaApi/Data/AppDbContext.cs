using System.Security.Cryptography;
using CinemaTicketSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace CinemaApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Cinema> Cinemas => Set<Cinema>();
        public DbSet<Screening> Screenings => Set<Screening>();
        public DbSet<Reservation> Reservations => Set<Reservation>();

        public override int SaveChanges()
        {
            UpdateUserRowVersions();
            return base.SaveChanges(acceptAllChangesOnSuccess: true);
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            UpdateUserRowVersions();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override Task<int> SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            UpdateUserRowVersions();
            return base.SaveChangesAsync(
                acceptAllChangesOnSuccess: true,
                cancellationToken);
        }

        public override Task<int> SaveChangesAsync(
            bool acceptAllChangesOnSuccess,
            CancellationToken cancellationToken = default)
        {
            UpdateUserRowVersions();
            return base.SaveChangesAsync(
                acceptAllChangesOnSuccess,
                cancellationToken);
        }

        private void UpdateUserRowVersions()
        {
            foreach (var entry in ChangeTracker.Entries<User>())
            {
                if (entry.State == EntityState.Added ||
                    entry.State == EntityState.Modified)
                {
                    var rowVersion = entry.Property(u => u.RowVersion);

                    rowVersion.CurrentValue =
                        RandomNumberGenerator.GetBytes(8);

                    if (entry.State == EntityState.Modified)
                    {
                        rowVersion.IsModified = true;
                    }
                }
            }
        }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            // SQLite does not auto-update rowversion values like SQL Server.
            // We keep [Timestamp]/RowVersion for EF optimistic concurrency,
            // but generate the byte[] value ourselves in SaveChanges.
            modelBuilder.Entity<User>()
                .Property(u => u.RowVersion)
                .IsConcurrencyToken()
                .ValueGeneratedNever();

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => new { r.ScreeningId, r.Row, r.Seat })
                .IsUnique();

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Screening)
                .WithMany()
                .HasForeignKey(r => r.ScreeningId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // cinemas
            modelBuilder.Entity<Cinema>().HasData(
                new Cinema
                {
                    Id = 1,
                    Name = "Cinema city",
                    Rows = 5,
                    SeatsPerRow = 8
                },
                new Cinema
                {
                    Id = 2,
                    Name = "Multikino",
                    Rows = 6,
                    SeatsPerRow = 10
                },
                new Cinema
                {
                    Id = 3,
                    Name = "Helios",
                    Rows = 4,
                    SeatsPerRow = 6
                }
            );

            // screenings
            modelBuilder.Entity<Screening>().HasData(
                new Screening
                {
                    Id = 1,
                    FilmTitle = "Avengers Endgame",
                    StartTime =
                        new DateTime(2026, 6, 1, 18, 0, 0),
                    CinemaId = 1
                },
                new Screening
                {
                    Id = 2,
                    FilmTitle = "Interstellar",
                    StartTime =
                        new DateTime(2026, 6, 1, 20, 0, 0),
                    CinemaId = 2
                }
            );
        }
    }
}
