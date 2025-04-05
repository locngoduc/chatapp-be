import { RequestContext } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/postgresql';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SuccessResponse } from 'src/shared/classes/wrapper';
import { CreateMembershipRequestDto } from './dto/create-membership.dto';
import { MembershipEntity } from './entities/membership.entity';
import { MembershipService } from './membership.service';
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
    @MessageBody() createMembershipDto: CreateMembershipRequestDto,
  ) {
    return await RequestContext.create(this.orm.em, async () => {
      const result =
        await this.membershipService.createMembership(createMembershipDto);

      if (result.isOk()) {
        return new SuccessResponse<MembershipEntity>(
          'Membership created successfully!',
          result.value,
        );
      } else {
        return result.error.toJSON();
      }
    });
  }

  @SubscribeMessage('deleteMembership')
  async handleDeleteMembership(
    @MessageBody() data: { userId: string; groupId: string },
  ) {
    return await RequestContext.create(this.orm.em, async () => {
      const result = await this.membershipService.delete(
        data.userId,
        data.groupId,
      );

      if (result.isOk()) {
        return new SuccessResponse('Membership deleted successfully!');
      } else {
        return result.error.toJSON();
      }
    });
  }

  async handleConnection(client: Socket) {
    // await RequestContext.create(this.orm.em, async () => {
    //   const userId = client.handshake.query.userId as string;
    //   console.log(`Client connected: ${userId}`);
    //   if (!userId) {
    //     client.disconnect();
    //     return;
    //   }
    //   const result = await this.membershipService.getGroupsByUserId(userId);
    //   if (result.isErr()) {
    //     client.disconnect();
    //     return;
    //   }
    //   const groups = result.value;
    //   groups.forEach((group) => {
    //     client.join(group.id);
    //     console.log(`User ${userId} joined group ${group.id} successfully!`);
    //   });
    // });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
