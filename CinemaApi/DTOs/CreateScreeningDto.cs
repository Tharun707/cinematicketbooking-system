namespace CinemaApi.DTOs;

public class CreateScreeningDto
{
    public string FilmTitle { get; set; } = "";

    public DateTime StartTime { get; set; }

    public int CinemaId { get; set; }
}