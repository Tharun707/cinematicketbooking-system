using CinemaApi.Data;
using CinemaApi.DTOs;
using CinemaTicketSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/User
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .OrderBy(x => x.Id)
                .ToListAsync();

            return Ok(users);
        }

        // POST: api/User/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginUserDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Username == dto.Username &&
                    x.Password == dto.Password);

            if (user == null)
            {
                return Unauthorized(new
                {
                    error = "Invalid username or password."
                });
            }

            return Ok(user);
        }

        // POST: api/User/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterUserDto dto)
        {
            bool exists = await _context.Users
                .AnyAsync(x => x.Username == dto.Username);

            if (exists)
            {
                return BadRequest(new
                {
                    error = "Username already exists."
                });
            }

            var user = new User
            {
                Username = dto.Username,
                Password = dto.Password,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                Role = "User"
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // PUT: api/User/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            if (dto.RowVersion == null || dto.RowVersion.Length == 0)
            {
                return BadRequest(new
                {
                    error = "RowVersion is required for concurrency checking."
                });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            bool usernameTaken = await _context.Users
                .AnyAsync(x => x.Id != id && x.Username == dto.Username);

            if (usernameTaken)
            {
                return BadRequest(new
                {
                    error = "Username already exists."
                });
            }

            // SQLite does not behave exactly like SQL Server rowversion.
            // To make Task 3 reliable on SQLite, we explicitly compare
            // the rowVersion that came from the browser with the latest
            // rowVersion currently stored in the database.
            if (!user.RowVersion.SequenceEqual(dto.RowVersion))
            {
                return Conflict(new
                {
                    error = "This user was modified by another process. Please reload and try again.",
                    currentUser = user
                });
            }

            user.Username = dto.Username;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.PhoneNumber = dto.PhoneNumber;
            user.Email = dto.Email;
            user.Role = string.IsNullOrWhiteSpace(dto.Role)
                ? "User"
                : dto.Role;

            var entry = _context.Entry(user);
            entry.Property(u => u.RowVersion).OriginalValue = dto.RowVersion;

            try
            {
                await _context.SaveChangesAsync();

                return Ok(user);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    error = "This user was modified by another process. Please reload and try again."
                });
            }
        }

        // DELETE: api/User/{id}?rowVersion=...
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id, [FromQuery] string rowVersion)
        {
            if (string.IsNullOrWhiteSpace(rowVersion))
            {
                return BadRequest(new
                {
                    error = "RowVersion is required for concurrency checking."
                });
            }

            byte[] incomingVersion;

            try
            {
                incomingVersion = Convert.FromBase64String(rowVersion);
            }
            catch (FormatException)
            {
                return BadRequest(new
                {
                    error = "RowVersion must be a valid Base64 string."
                });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            if (!user.RowVersion.SequenceEqual(incomingVersion))
            {
                return Conflict(new
                {
                    error = "This user was modified by another administrator. Please reload and try again.",
                    currentUser = user
                });
            }

            var entry = _context.Entry(user);
            entry.Property(u => u.RowVersion).OriginalValue = incomingVersion;

            try
            {
                _context.Users.Remove(user);

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    error = "This user was modified by another administrator. Please reload and try again."
                });
            }
        }
    }
}
