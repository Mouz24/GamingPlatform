import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | undefined;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://peabody28.com:1032/battleshipHub')
      .withAutomaticReconnect()
      .build();

    this.connection.start().catch(error => console.error(error));
  }

  public getConnection() {
    return this.connection;
  }

  public fireShot = async (lobbyName:string | undefined, targetX: number, targetY: number) => {
    try {
        if (this.connection) 
        {
            await this.connection.invoke('FireShot', lobbyName, targetX, targetY);
        }
    } catch (error) {
      console.error('Error firing shot:', error);
    }
  };

  public leaveLobby(lobbyName: string | undefined) {
    if (this.connection && lobbyName)
    {
      this.connection.invoke('LeaveLobby', lobbyName);
    }
  }
}

const signalRService = new SignalRService();

export default signalRService;
