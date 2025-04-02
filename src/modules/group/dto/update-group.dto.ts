import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupRequestDto } from './create-group.dto';

export class UpdateGroupDto extends PartialType(CreateGroupRequestDto) {}
