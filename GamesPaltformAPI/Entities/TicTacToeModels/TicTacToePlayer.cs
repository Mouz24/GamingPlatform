using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.TicTacToeModels
{
    public class TicTacToePlayer
    {
        public string ConnectionId { get; set; }
        public string PlayerName { get; set; }
        public char Marker { get; set; }
    }
}
