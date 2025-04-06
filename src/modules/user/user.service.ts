import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityManager,
  EntityRepository,
  Transactional,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { err, ok, Result } from 'neverthrow';
import { UserEntity } from './entities/user.entity';
import { CreateAccountRequestDto } from './dtos/create-account-request.dto';
import { UserError } from './errors/base-user.error';
import { EmailTakenError } from './errors/email-taken.error';
import { DatabaseError } from 'src/shared/errors/database.error';
import { GroupEntity } from '../group/entities/group.entity';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: EntityRepository<UserEntity>,
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  public async createUser(
    data: CreateAccountRequestDto,
  ): Promise<Result<UserEntity, UserError | DatabaseError>> {
    const isEmailExists = await this.usersRepository.findOne({
      email: data.email,
    });
    if (isEmailExists) return err(new EmailTakenError(data.email));

    const newUser = this.usersRepository.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      hashedPassword: await argon2.hash(data.password),
    });

    try {
      await this.entityManager.flush();
      this.eventEmitter.emit('user.created', newUser);

      return ok(newUser);
    } catch (error) {
      console.error(error);
      return err(new DatabaseError('Unexpected error'));
    }
  }

  async getGroupsByUserId(
    userId: string,
  ): Promise<Result<GroupEntity[], EntityNotFoundError>> {
    const user = await this.usersRepository.findOne(
      { id: userId },
      { populate: ['groups'] },
    );

    if (!user) {
      return err(new EntityNotFoundError('User', userId));
    }

    return ok(user.groups.getItems());
  }

  @OnEvent('user.created')
  public async handleUserCreatedEvent(user: UserEntity) {
    console.log('User created event:', user);
    // Handle the event, e.g., send a welcome email
  }
}
