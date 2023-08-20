using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.BattleShip
{
    public class Ship
    {
        public int Type { get; set; }
        public List<Segment> Segments { get; set; } = new List<Segment>();
        public int Length { get; set; }
        public int Hits { get; set; }
        public bool IsSunk => Hits >= Length;
    }

}
