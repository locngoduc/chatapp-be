import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@WebSocketGateway()
export class MembershipGateway {
  constructor(private readonly membershipService: MembershipService) {}

  @SubscribeMessage('createMembership')
  create(@MessageBody() createMembershipDto: CreateMembershipDto) {
    return this.membershipService.create(createMembershipDto);
  }

  @SubscribeMessage('findAllMembership')
  findAll() {
    return this.membershipService.findAll();
  }

  @SubscribeMessage('findOneMembership')
  findOne(@MessageBody() id: number) {
    return this.membershipService.findOne(id);
  }

  @SubscribeMessage('updateMembership')
  update(@MessageBody() updateMembershipDto: UpdateMembershipDto) {
    return this.membershipService.update(updateMembershipDto.id, updateMembershipDto);
  }

  @SubscribeMessage('removeMembership')
  remove(@MessageBody() id: number) {
    return this.membershipService.remove(id);
  }
}
