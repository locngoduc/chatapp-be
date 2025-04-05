import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateGroupRequestDto } from './dto/create-group.dto';
import { GroupService } from './group.service';
import { SuccessResponse } from 'src/shared/classes/wrapper';
import { GroupEntity } from './entities/group.entity';
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async create(
    @Body() createGroupDto: CreateGroupRequestDto,
    @Res() res: Response,
  ) {
    const result = await this.groupService.create(createGroupDto);

    if (result.isOk()) {
      return res
        .status(HttpStatus.CREATED)
        .json(
          new SuccessResponse<GroupEntity>(
            'Group created successfully!',
            result.value,
          ),
        );
    } else {
      return result.error.createResponse(res);
    }
  }
}
