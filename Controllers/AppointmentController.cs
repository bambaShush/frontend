using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[Route("api/appointment")]
[ApiController]
public class AppointmentController : ControllerBase
{
    private readonly DatabaseHelper _dbHelper;
    private readonly UserService _userService;
    private readonly AppointmentService _appointmentService;
    public AppointmentController(DatabaseHelper dbHelper, UserService userService, AppointmentService appointmentService)
    {
        _dbHelper = dbHelper;
        _userService = userService;
        _appointmentService = appointmentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        var appointments = await _appointmentService.GetAppointments();
        return Ok(appointments);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAppointment([FromBody] AppointmentDto request)
    {
        var userId = _userService.GetCurrentUserId();
        await _appointmentService.CreateAppointment(request, userId);
        return Ok("Appointment created successfully");
    }

    [HttpPut]
    public async Task<IActionResult> UpdateAppointment([FromBody] AppointmentDto request)
    {
        var userId = _userService.GetCurrentUserId();
        await _appointmentService.UpdateAppointment(request, userId);

        return Ok("Appointment updated successfully");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        var userId = _userService.GetCurrentUserId();
        await _appointmentService.DeleteAppointment(id, userId);

        return Ok("Appointment deleted successfully");
    }

    [HttpGet("existingDates")]
    public async Task<IActionResult> GetDates()
    {
        return Ok(await _appointmentService.GetDates());
    }
}