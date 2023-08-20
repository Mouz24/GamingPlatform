using Games.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Games.Controllers
{
    [Route("api/tic-tac-toe")]
    [ApiController]
    public class TicTacToeController : ControllerBase
    {
        [HttpGet("lobbies")]
        public IActionResult GetOpenLobbies()
        {
            var openLobbies = TicTacToeHub._games.Where(pair => pair.Value.PlayerO == null).Select(pair => pair.Key);

            return Ok(openLobbies);
        }
    }
}
