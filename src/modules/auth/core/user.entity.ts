import { roleEnum } from '~/db/schema';

export type Role = (typeof roleEnum.enumValues)[number];

export interface User {
    id: string;
    email: string;
    hashedPassword: string;
    role: Role;
    organizationId: string;
}