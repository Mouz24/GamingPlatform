using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.BattleShip
{
    public class BattleshipPlayer
    {
        public string ConnectionId { get; set; }
        public string PlayerName { get; set; }
        public List<Ship> Ships { get; set; } = new List<Ship>();
        public char[,] OwnGrid { get; set; } = new char[10, 10];
        public char[,] TrackingGrid { get; set; } = new char[10, 10];
    }

}
