namespace CinemaApi.DTOs
{
    public class CreateReservationDto
    {
        public int ScreeningId { get; set; }
        public int UserId { get; set; }
        public int Row { get; set; }
        public int Seat { get; set; }
    }
}
