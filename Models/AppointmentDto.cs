public class AppointmentDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFirstName { get; set; }
    public DateTime AppointmentDate { get; set; }
    public DateTime CreatedAt { get; set; }
}