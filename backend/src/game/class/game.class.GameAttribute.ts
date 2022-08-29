import {
  CreateGameRoomDto,
  GameResultDto,
  GameRoomProfileDto,
} from '../dto/game.dto';
import { GameRtData } from './game.class.GameRtData';
import { GameInfo } from './game.class.interface';
import { Player } from './game.class.Player';

export class GameAttribute {
  active: boolean;
  roomId: number;
  ownerId: number;
  roomTitle: string;
  password: string | null;
  gameMode: 'normal' | 'speed' | 'obstacle';
  firstPlayer: Player | null;
  secondPlayer: Player | null;
  watchers: Set<Player>;
  playerCount: number;
  isLadder: boolean;
  isPublic: boolean;
  isPlaying: boolean;
  isDestroying: boolean;
  rtData: GameRtData;
  isSocketUpdated: boolean;
  timers: Map<string, NodeJS.Timer>;

  constructor(gameId: number) {
    this.active = false;
    this.roomId = gameId;
    this.roomTitle = '';
    this.ownerId = undefined;
    this.password = undefined;
    this.gameMode = undefined;
    this.firstPlayer = null;
    this.secondPlayer = null;
    this.watchers = new Set();
    this.playerCount = 0;
    this.isLadder = false;
    this.isPublic = false;
    this.isPlaying = false;
    this.isDestroying = false;
    this.isSocketUpdated = false;
    this.rtData = new GameRtData();
    this.timers = new Map();
  }

  create(createGameRoomDto: CreateGameRoomDto, player1: Player) {
    this.active = true;
    this.roomTitle = createGameRoomDto.roomTitle;
    this.ownerId = createGameRoomDto.ownerId;
    this.password = createGameRoomDto.password;
    this.gameMode = createGameRoomDto.gameMode;
    this.firstPlayer = player1;
    this.secondPlayer = null;
    this.watchers = new Set();
    this.playerCount = player1 ? 1 : 0;
    this.isPublic = !createGameRoomDto.password ? true : false;
    this.isPlaying = false;
    this.rtData = new GameRtData();
    this.isSocketUpdated = false;
    this.timers = new Map();
  }

  destroy(): void {
    this.broadcastToRoom('gameDestroyed');
    this.isDestroying = true;
    this.active = false;
    this.roomTitle = '';
    this.ownerId = undefined;
    this.password = undefined;
    this.gameMode = undefined;
    this.firstPlayer.leaveGame(this);
    this.firstPlayer = null;
    this.secondPlayer?.leaveGame(this);
    this.secondPlayer = null;
    this.watchers.forEach((player) => {
      player.leaveGame(this);
    });
    this.watchers.clear();
    this.playerCount = 0;
    this.isLadder = false;
    this.isPublic = false;
    this.isPlaying = false;
    this.isSocketUpdated = false;
    this.initPlayData();
    this.timers.forEach((timer) => {
      clearInterval(timer);
    });
    this.timers.clear();
    this.isDestroying = false;
  }

  toGameRoomProfileDto(): GameRoomProfileDto {
    const gameRoomProfileDto = new GameRoomProfileDto();
    gameRoomProfileDto.gameId = this.roomId;
    gameRoomProfileDto.roomTitle = this.roomTitle;
    gameRoomProfileDto.playerCount = this.playerCount;
    gameRoomProfileDto.isPublic = this.isPublic;
    gameRoomProfileDto.isStart = this.isPlaying;

    return gameRoomProfileDto;
  }

  toGameResultDto(): GameResultDto {
    const gameResultDto = new GameResultDto();
    gameResultDto.isLadder = this.isLadder;
    gameResultDto.playerOneId = this.firstPlayer.userId;
    gameResultDto.playerTwoId = this.secondPlayer.userId;
    gameResultDto.playerOneScore = this.rtData.scoreLeft;
    gameResultDto.playerTwoScore = this.rtData.scoreRight;
    gameResultDto.winnerId = this.getWinner().userId;

    return gameResultDto;
  }

  getWinner(): Player {
    if (this.isPlaying) return null;
    return this.rtData.scoreLeft > this.rtData.scoreRight
      ? this.firstPlayer
      : this.secondPlayer;
  }

  getAllPlayers(): Player[] {
    const players: Player[] = [];
    for (const player of this.watchers) players.push(player);
    players.unshift(this.secondPlayer);
    players.unshift(this.firstPlayer);
    return players;
  }

  setOwner(player: Player): boolean {
    if (!player) return false;
    if (player.gamePlaying.roomId !== this.roomId) return false;

    if (this.ownerId !== player.userId) return false;

    this.firstPlayer = player;
    return true;
  }

  checkPassWord(password: string): boolean {
    return this.password === password;
  }

  initPlayData(): void {
    this.isPlaying = false;
    delete this.rtData;
    this.rtData = new GameRtData();
  }

  updateRtData(data: GameInfo): void {
    this.rtData.updateRtData(data);
  }

  updatePaddleRtData(data: number): void {
    this.rtData.updatePaddleRtData(data);
  }

  broadcastToRoom(event: string, ...data: any[]): void {
    if (!this.firstPlayer) {
      console.log('broadcastToRoom: no player in Game');
      return;
    }
    const socket = this.firstPlayer.socketPlayingGame;
    if (!socket) return;
    socket.to(this.roomId.toString()).emit(event, ...data);
    socket.emit(event, ...data);
  }

  sendRtData(): void {
    const rtData = this.rtData;
    if (rtData.isReadyToSend() == false) {
      return;
    }
    // console.log(`sending ${rtData.toRtData()}`); // this line test only
    // rtLogger.log(500, `sending ${rtData.toRtData()}`);
    this.broadcastToRoom('rtData', rtData.toRtData());
    rtData.updateFlag = false;
  }

  isOnStartCount(): boolean {
    return this.timers.has('gameStartCount');
  }

  stopStartCount(): void {
    clearInterval(this.timers.get('gameStartCount'));
    this.timers.delete('gameStartCount');
  }

  startCountdown(): void {
    if (this.timers.has('gameStartCount')) return;

    let counting = 5;
    this.broadcastToRoom('gameStartCount', `${counting}`);

    const timer: NodeJS.Timer = setInterval(() => {
      this.broadcastToRoom('gameStartCount', `${counting}`);
      counting--;
      if (counting < 0) {
        this.stopStartCount();
        this.gameStart();
      }
    }, 1000);
    this.timers.set('gameStartCount', timer);
  }

  gameStart(): void {
    this.isPlaying = true;
    // change player's status
    this.sendRtData();
  }

  isFinished(): boolean {
    return this.rtData.scoreLeft >= 10 || this.rtData.scoreRight >= 10;
  }
}
