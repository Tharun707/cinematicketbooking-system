using System.ComponentModel.DataAnnotations;

namespace CinemaTicketSystem.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";

        [Timestamp]
        public byte[] RowVersion { get; set; }
            = Array.Empty<byte>();
    }
}