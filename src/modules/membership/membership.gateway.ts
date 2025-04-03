import { MikroORM } from '@mikro-orm/postgresql';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Result } from 'neverthrow';
import { Server, Socket } from 'socket.io';
import { SuccessResponse } from 'src/shared/classes/wrapper';
import { CreateMembershipRequestDto } from './dto/create-membership.dto';
import { MembershipService } from './membership.service';
import { RequestContext } from '@mikro-orm/core';
@WebSocketGateway()
export class MembershipGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly membershipService: MembershipService,
    private readonly orm: MikroORM,
  ) {}

  @SubscribeMessage('createMembership')
  async handleCreateMembership(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMembershipDto: CreateMembershipRequestDto,
  ) {
    return await RequestContext.create(this.orm.em, async () => {
      // validate the data
      const { userId, groupId } = createMembershipDto;

      const membership =
        await this.membershipService.createMembership(createMembershipDto);

      if (membership.isErr()) {
        client.leave(groupId);
        return;
      }

      client.join(groupId);

      console.log(`User ${userId} joined group ${groupId} successfully!`);

      return `User ${userId} joined group ${groupId} successfully!`;
    });
  }
  @SubscribeMessage('deleteMembership')
  async handleDeleteMembership(
    @MessageBody() data: { userId: string; groupId: string },
  ): Promise<Result<SuccessResponse, Error>> {
    return this.membershipService.delete(data.userId, data.groupId);
  }

  async handleConnection(client: Socket) {
    await RequestContext.create(this.orm.em, async () => {
      const userId = client.handshake.query.userId as string;
      console.log(`Client connected: ${userId}`);

      if (!userId) {
        client.disconnect();
        return;
      }
      const result = await this.membershipService.getGroupsByUserId(userId);
      if (result.isErr()) {
        client.disconnect();
        return;
      }
      const groups = result.value.data;
      groups.forEach((group) => {
        client.join(group.id);
        console.log(`User ${userId} joined group ${group.id} successfully!`);
      });
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
