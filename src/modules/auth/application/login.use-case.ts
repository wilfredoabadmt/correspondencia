import { User } from '../core/user.entity';

/**
 * Input Data Transfer Object for the login use case.
 */
export interface LoginInput {
    email: string;
    password: string;
    organizationId: string; // This would likely come from a subdomain or a selection on the login page.
}

/**
 * The output of a successful login, excluding sensitive data.
 */
export type LoginOutput = Omit<User, 'hashedPassword'>;

export interface ILoginUseCase {
    execute(input: LoginInput): Promise<LoginOutput>;
}