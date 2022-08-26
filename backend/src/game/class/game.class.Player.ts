import { Socket } from 'socket.io';
import { GameAttribute } from './game.class.GameAttribute';

export class Player {
  socketLobby: Socket;
  socketQueue: Socket;
  socketPlayingGame: Socket;
  socketsToGameMap: Map<Socket, GameAttribute>;
  userId: number;
  gamePlaying: GameAttribute;
  gamesWatching: Map<GameAttribute, Socket>;
  inLadderQ: boolean;

  constructor(userId: number, game: GameAttribute) {
    this.socketLobby = null;
    this.socketQueue = null;
    this.socketPlayingGame = null;
    this.socketsToGameMap = new Map<Socket, GameAttribute>();
    this.userId = userId;
    this.gamePlaying = game;
    this.gamesWatching = new Map<GameAttribute, Socket>();
    this.inLadderQ = false;
  }

  clear(): void {
    this.socketLobby = null;
    this.socketQueue = null;
    this.socketPlayingGame = null;
    delete this.socketsToGameMap;
    this.socketsToGameMap = new Map<Socket, GameAttribute>();
    this.gamePlaying = null;
    delete this.gamesWatching;
    this.gamesWatching = new Map<GameAttribute, Socket>();
    this.inLadderQ = false;
  }

  setGameSocket(game: GameAttribute, socket: Socket): void {
    if (!game || !socket) return;

    if (game === this.gamePlaying) {
      this.socketPlayingGame = socket;
    } else {
      this.gamesWatching.set(game, socket);
    }
    this.socketsToGameMap.set(socket, game);
  }

  unsetGameSocket(socket: Socket): void {
    const game = this.socketsToGameMap.get(socket);
    if (!game) return;

    this.socketsToGameMap.delete(socket);
    if (socket === this.socketPlayingGame) this.socketPlayingGame = null;
    else this.gamesWatching.delete(game);
  }

  joinGame(game: GameAttribute): boolean {
    if (!game) return false;
    if (!game.secondPlayer) {
      game.secondPlayer = this;
      this.gamePlaying = game;
    } else {
      game.watchers.add(this);
      this.gamesWatching.set(game, null);
    }
    game.playerCount++;
    game.isSocketUpdated = false;
    return true;
  }

  leaveGame(game: GameAttribute): boolean {
    if (!game) {
      console.log('leaveGameRoom: no game');
      return false;
    }
    if (
      game.roomId !== this.gamePlaying.roomId &&
      !this.gamesWatching.has(game)
    )
      return false;

    switch (this) {
      case game.firstPlayer:
        this.gamePlaying = null;
        this.socketsToGameMap.delete(this.socketPlayingGame);
        this.socketPlayingGame = null;
        game.destroy();
        break;
      case game.secondPlayer:
        this.gamePlaying = null;
        this.socketsToGameMap.delete(this.socketPlayingGame);
        this.socketPlayingGame = null;
        game.secondPlayer = null;
        if (game.isOnStartCount()) game.stopStartCount();
        break;
      default:
        this.socketsToGameMap.delete(this.gamesWatching.get(game));
        this.gamesWatching.delete(game);
        game.watchers.delete(this);
    }
    return true;
  }

  findGameHasUnsettedSocket(): GameAttribute {
    for (const entry of this.gamesWatching.entries()) {
      if (entry[1] === null) return entry[0];
    }
    return undefined;
  }

  isJoinedGame(game: GameAttribute): boolean {
    if (this.gamePlaying === game || this.gamesWatching.has(game)) return true;
    return false;
  }
}
