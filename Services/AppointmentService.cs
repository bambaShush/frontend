using System.Data;
using System.Threading.Tasks;
using Dapper;

public class AppointmentService
{

    private readonly DatabaseHelper _dbHelper;

    public AppointmentService(DatabaseHelper dbHelper)
    {
        _dbHelper = dbHelper;
    }

    public async Task<IEnumerable<AppointmentDto>> GetAppointments()
    {
        using var connection = _dbHelper.CreateConnection();

        return await connection.QueryAsync<AppointmentDto>(
            "GetAppointments",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task CreateAppointment(AppointmentDto request, int userId)
    {
        using var connection = _dbHelper.CreateConnection();
        var sql = "INSERT INTO Appointments (UserId, AppointmentDate) VALUES (@userId, @AppointmentDate)";
        await connection.ExecuteAsync(sql, new { request.AppointmentDate, userId });
    }

    public async Task UpdateAppointment(AppointmentDto request, int userId)
    {
        using var connection = _dbHelper.CreateConnection();
        var sql = "Update Appointments set AppointmentDate = @AppointmentDate where UserId = @userId AND Id = @Id";
        await connection.ExecuteAsync(sql, new { request.AppointmentDate, userId, request.Id });
    }
    public async Task DeleteAppointment(int id, int userId)
    {
        using var connection = _dbHelper.CreateConnection();
        var sql = "Update Appointments set IsDeleted = 1 where UserId = @userId AND Id = @id";
        await connection.ExecuteAsync(sql, new { userId, id });
    }

    public async Task<IEnumerable<DateTime>> GetDates()
    {
        using var connection = _dbHelper.CreateConnection();

        var existingDates = await connection.QueryAsync<DateTime?>(
            "select AppointmentDate from Appointments(nolock) where AppointmentDate > GETDATE() AND DATEPART(HOUR, AppointmentDate) >= 8"
        );
        return existingDates.Where(dt => dt.HasValue).Select(dt => dt.Value);
    }

}
