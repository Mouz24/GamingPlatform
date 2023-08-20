using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.TicTacToeModels
{
    public class TicTacToeGame
    {
        public TicTacToePlayer PlayerX { get; set; }
        public TicTacToePlayer PlayerO { get; set; }
        public char[,] Board { get; set; } = new char[3, 3];
        public TicTacToePlayer CurrentPlayer { get; set; }
        public bool IsGameEnded { get; set; }
    }

}
