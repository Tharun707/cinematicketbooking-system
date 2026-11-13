namespace CinemaTicketSystem.Models
{
    public class Reservation
    {
        public int Id { get; set; }

        public int ScreeningId { get; set; }
        public Screening? Screening { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int Row { get; set; }
        public int Seat { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
