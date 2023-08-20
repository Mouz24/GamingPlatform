using Games.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Games.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BattleshipController : ControllerBase
    {
        [HttpGet("lobbies")]
        public IActionResult GetOpenLobbies()
        {
            var openLobbies = BattleshipHub._lobbies.Where(pair => pair.Value.Count < 2).Select(pair => pair.Key);

            return Ok(openLobbies);
        }
    }
}
