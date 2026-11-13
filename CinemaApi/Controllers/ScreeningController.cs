using CinemaApi.Data;
using CinemaApi.DTOs;
using CinemaTicketSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScreeningController : ControllerBase
{
    private readonly AppDbContext _context;

    public ScreeningController(
        AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var screenings = await _context.Screenings
            .Include(x => x.Cinema)
            .ToListAsync();

        return Ok(screenings);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateScreeningDto dto)
    {
        var screening = new Screening
        {
            FilmTitle = dto.FilmTitle,
            StartTime = dto.StartTime,
            CinemaId = dto.CinemaId
        };

        _context.Screenings.Add(screening);

        await _context.SaveChangesAsync();

        return Ok(screening);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var screening =
            await _context.Screenings.FindAsync(id);

        if (screening == null)
            return NotFound();

        _context.Screenings.Remove(screening);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}