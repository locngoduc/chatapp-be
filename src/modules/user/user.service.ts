import { InjectRepository } from '@mikro-orm/nestjs';
import {
  CreateRequestContext,
  EntityManager,
  EntityRepository,
  MikroORM,
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: EntityRepository<UserEntity>,
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
    private readonly orm: MikroORM,
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

  @OnEvent('user.created')
  public async handleUserCreatedEvent(user: UserEntity) {
    console.log('User created event:', user);
    // Handle the event, e.g., send a welcome email
  }

  async findUserByEmail(
    email: string,
  ): Promise<Result<UserEntity, UserError | DatabaseError>> {
    const user = await this.usersRepository.findOne({ email });
    if (user) return ok(user);
    else return err(new UserError('User not found'));
  }

  @CreateRequestContext()
  async findUserById(
    id: string,
  ): Promise<Result<UserEntity, UserError | DatabaseError>> {
    // const user = await this.usersRepository.findOne({ id });
    // const em = this.entityManager.fork();
    const user = await this.usersRepository.findOne({ id });
    if (user) return ok(user);
    else return err(new UserError('User not found'));
  }
}
