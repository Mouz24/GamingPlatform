import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | undefined;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://peabody28.com:1032/ticTacToeHub')
      .withAutomaticReconnect()
      .build();

    this.connection.start().catch(error => console.error(error));
  }

  public getConnection() {
    return this.connection;
  }

  public makeMove(row: number, col: number, gameEnded: boolean, currentPlayer: string, playerMarker: string, lobbyName: string) {
    if (!gameEnded && currentPlayer === playerMarker && this.connection) {
        this.connection.invoke('MakeMove', lobbyName, row, col);
        }
  }

  public leaveLobby(lobbyName: string, playerName: string) {
    if (this.connection)
    {
      this.connection.invoke('LeaveGame', lobbyName, playerName);
    }
  }
}

const signalRService = new SignalRService();
export default signalRService;
