import { Injectable } from '@nestjs/common';

@Injectable()
export class DictionaryService {
  private userToSocketMappings: Map<string, string[]> = new Map();

  addUserSocket(userId: string, socketId: string): void {
    const sockets = this.userToSocketMappings.get(userId) || [];
    if (!sockets.includes(socketId)) {
      sockets.push(socketId);
      this.userToSocketMappings.set(userId, sockets);
    }
  }

  removeUserSocket(userId: string, socketId: string) {
    const sockets = this.userToSocketMappings.get(userId);
    if (!sockets) return;

    const updated = sockets.filter((id) => id !== socketId);
    if (updated.length > 0) {
      this.userToSocketMappings.set(userId, updated);
    } else {
      this.userToSocketMappings.delete(userId);
    }
  }

  getUserSockets(userId: string) {
    return this.userToSocketMappings.get(userId) || [];
  }

  getAllMappings() {
    return this.userToSocketMappings;
  }
}
