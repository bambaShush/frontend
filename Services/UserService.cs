using System.Security.Claims;
using System.Text;
using Dapper;
using Microsoft.VisualBasic;

public class UserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly JwtService _jwtService;

    private readonly DatabaseHelper _dbHelper;

    public UserService(IConfiguration config, IHttpContextAccessor httpContextAccessor, DatabaseHelper dbHelper)
    {
        _jwtService = new JwtService(config);
        _httpContextAccessor = httpContextAccessor;
        _dbHelper = dbHelper;
    }

    public int GetCurrentUserId()
    {
        if (!int.TryParse(_httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId))
            throw new UnauthorizedAccessException("User ID not found in token");
        return userId;
    }

    public async Task<UserResult> Register(UserDto request)
    {
        using (var connection = _dbHelper.CreateConnection())
        {
            var existingUser = await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM Users WHERE Username = @UserName",
                new { request.UserName });

            if (existingUser != null)
                return new UserResult() { UserResultType = UserResultType.UserAlreadyExists };

            AuthService.CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var sql = "INSERT INTO Users (Username, FirstName, PasswordHash, PasswordSalt) VALUES (@Username, @FirstName, @PasswordHash, @PasswordSalt)";
            await connection.ExecuteAsync(sql, new { request.UserName, request.FirstName, PasswordHash = passwordHash, PasswordSalt = passwordSalt });

            return new UserResult() { UserResultType = UserResultType.Success };
        }
    }

    public async Task<UserResult> Login(UserDto request)
    {
        using (var connection = _dbHelper.CreateConnection())
        {
            var user = await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM Users WHERE Username = @UserName",
                new { request.UserName });

            if (user == null || !AuthService.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt))
                return new UserResult() { UserResultType = UserResultType.InvalidCredentials };

            var token = _jwtService.GenerateToken(user);
            return new UserResult(user.Id, token, user.Username, user.FirstName, UserResultType.Success);
        }
    }


    public struct UserResult
    {
        public UserResult(int userId, string token, string username, string firstName, UserResultType userResultType)
        {
            UserId = userId;
            Token = token;
            Username = username;
            FirstName = firstName;
            UserResultType = userResultType;
        }
        public int UserId { get; set; }
        public string Token { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public UserResultType UserResultType { get; set; }
    }

    public enum UserResultType
    {
        Success,
        UserAlreadyExists,
        InvalidCredentials,
    }

}
