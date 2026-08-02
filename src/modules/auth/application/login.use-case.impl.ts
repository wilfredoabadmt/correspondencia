import { compare } from 'bcryptjs';
import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRepository } from '../core/user.repository';
import type { ILoginUseCase, LoginInput, LoginOutput } from './login.use-case';

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

@injectable()
export class LoginUseCase implements ILoginUseCase {
    constructor(
        @inject(InjectionTokens.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(input: LoginInput): Promise<LoginOutput> {
        const user = await this.userRepository.findByEmail(
            input.email,
            input.organizationId
        );

        if (!user) {
            throw new AuthenticationError('Invalid credentials.');
        }

        const isPasswordValid = await compare(input.password, user.hashedPassword);

        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid credentials.');
        }

        const { hashedPassword, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }
}