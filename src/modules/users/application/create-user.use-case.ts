import { inject, injectable } from 'tsyringe';
import * as bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2'; // Para generar contraseñas temporales

import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRepository, User, UserRole } from '../core/user.repository';

type CreateUserUseCaseRequest = {
    name: string;
    email: string;
    role: UserRole;
    organizationId: string;
    actingUserId: string; // ID del usuario que realiza la acción (ADMIN/SUPERADMIN)
    actingUserRole: string; // Rol del usuario que realiza la acción (ADMIN/SUPERADMIN)
};

type CreateUserUseCaseResponse = {
    user: User;
    temporaryPassword: string;
};

@injectable()
export class CreateUserUseCase {
    private readonly AUTHORIZED_ROLES = ['ADMINISTRADOR', 'SUPERADMIN'];
    private readonly BCRYPT_SALT_ROUNDS = 10; // Número de rondas de sal para bcrypt

    constructor(
        @inject(InjectionTokens.UserRepository)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute({
        name,
        email,
        role,
        organizationId,
        actingUserRole,
    }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
        // 1. Control de autorización basado en roles
        if (!this.AUTHORIZED_ROLES.includes(actingUserRole)) {
            throw new Error(`Forbidden: User with role '${actingUserRole}' is not authorized to create users.`);
        }

        // 2. Validar unicidad del email dentro de la organización
        const existingUser = await this.userRepository.findByEmail(email, organizationId);
        if (existingUser) {
            throw new Error('Validation Error: An user with this email already exists in this organization.');
        }

        // 3. Generar y hashear contraseña temporal
        const temporaryPassword = createId().substring(0, 10); // Generar una contraseña temporal simple
        const hashedPassword = await bcrypt.hash(temporaryPassword, this.BCRYPT_SALT_ROUNDS);

        // 4. Crear el usuario
        const user = await this.userRepository.create({ name, email, role, organizationId, hashedPassword });

        return { user, temporaryPassword };
    }
}