using Microsoft.AspNetCore.Mvc;
using static UserService;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;

    public AuthController(IConfiguration config, UserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserDto request)
    {
        var result = await _userService.Register(request);
        if (result.UserResultType == UserResultType.UserAlreadyExists)
            return Conflict("User already exists.");

        result = await _userService.Login(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] UserDto request)
    {
        var result = await _userService.Login(request);
        if (result.UserResultType == UserResultType.InvalidCredentials)
            return Unauthorized("Invalid credentials.");
        return Ok(result);
    }
}
