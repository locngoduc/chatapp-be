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
import { CreateUserGroupRequestDto } from './dto/create-user_group.dto';
import { UserGroupEntity } from './entities/user_group.entity';
import { UserGroupService } from './user_group.service';
@WebSocketGateway()
export class UserGroupGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly userGroupService: UserGroupService,
    private readonly orm: MikroORM,
  ) {}

  @SubscribeMessage('createUserGroup')
  async handleCreateUserGroup(
    @MessageBody() createUserGroupDto: CreateUserGroupRequestDto,
  ) {
    return await RequestContext.create(this.orm.em, async () => {
      const result =
        await this.userGroupService.createUserGroup(createUserGroupDto);

      if (result.isOk()) {
        return new SuccessResponse<UserGroupEntity>(
          'UserGroup created successfully!',
          result.value,
        );
      } else {
        return result.error.toJSON();
      }
    });
  }

  @SubscribeMessage('deleteUserGroup')
  async handleDeleteUserGroup(
    @MessageBody() data: { userId: string; groupId: string },
  ) {
    return await RequestContext.create(this.orm.em, async () => {
      const result = await this.userGroupService.delete(
        data.userId,
        data.groupId,
      );

      if (result.isOk()) {
        return new SuccessResponse('UserGroup deleted successfully!');
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
    //   const result = await this.userGroupService.getGroupsByUserId(userId);
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
