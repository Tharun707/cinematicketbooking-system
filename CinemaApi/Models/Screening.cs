namespace CinemaTicketSystem.Models
{
    public class Screening
    {
        public int Id { get; set; }
        public string FilmTitle { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public int CinemaId { get; set; }
        public Cinema? Cinema { get; set; }

    }
}