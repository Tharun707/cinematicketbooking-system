using CinemaApi.Data;
using CinemaApi.DTOs;
using CinemaTicketSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservationController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("screening/{screeningId}")]
    public async Task<IActionResult> GetForScreening(int screeningId)
    {
        var reservations = await _context.Reservations
            .Where(x => x.ScreeningId == screeningId)
            .OrderBy(x => x.Row)
            .ThenBy(x => x.Seat)
            .Select(x => new
            {
                x.Id,
                x.ScreeningId,
                x.UserId,
                x.Row,
                x.Seat
            })
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpPost]
    public async Task<IActionResult> Reserve(CreateReservationDto dto)
    {
        var screening = await _context.Screenings
            .Include(x => x.Cinema)
            .FirstOrDefaultAsync(x => x.Id == dto.ScreeningId);

        if (screening?.Cinema == null)
            return NotFound(new { error = "Screening not found." });

        bool userExists = await _context.Users.AnyAsync(x => x.Id == dto.UserId);

        if (!userExists)
            return BadRequest(new { error = "User not found." });

        bool invalidSeat = dto.Row < 1 || dto.Seat < 1 ||
            dto.Row > screening.Cinema.Rows ||
            dto.Seat > screening.Cinema.SeatsPerRow;

        if (invalidSeat)
            return BadRequest(new { error = "Seat is outside the room." });

        var reservation = new Reservation
        {
            ScreeningId = dto.ScreeningId,
            UserId = dto.UserId,
            Row = dto.Row,
            Seat = dto.Seat
        };

        _context.Reservations.Add(reservation);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { error = "This seat is already reserved." });
        }

        return Ok(new
        {
            reservation.Id,
            reservation.ScreeningId,
            reservation.UserId,
            reservation.Row,
            reservation.Seat
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Release(int id, [FromQuery] int userId)
    {
        var reservation = await _context.Reservations.FindAsync(id);

        if (reservation == null)
            return NotFound();

        if (reservation.UserId != userId)
            return StatusCode(403, new { error = "You can cancel only your own reservation." });

        _context.Reservations.Remove(reservation);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
