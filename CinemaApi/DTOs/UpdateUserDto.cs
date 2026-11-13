using System.ComponentModel.DataAnnotations;

namespace CinemaApi.DTOs
{
    public class UpdateUserDto
    {
        [Required]
        public string Username { get; set; } = "";

        public string FirstName { get; set; } = "";

        public string LastName { get; set; } = "";

        public string PhoneNumber { get; set; } = "";

        public string Email { get; set; } = "";

        public string Role { get; set; } = "User";

        // concurrency token
        public byte[] RowVersion { get; set; }
            = Array.Empty<byte>();
    }
}