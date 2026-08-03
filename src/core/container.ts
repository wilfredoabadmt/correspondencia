import 'reflect-metadata';
import { container } from 'tsyringe';
import { InjectionTokens } from './injection-tokens';

import { AssignRoleUseCase } from '~/modules/auth/application/assign-role.use-case.impl';
import { LoginUseCase } from '~/modules/auth/application/login.use-case.impl';

import { CreateAreaUseCase } from '~/modules/gestion-documental/application/create-area.use-case.impl';
import { DeleteAreaUseCase } from '~/modules/gestion-documental/application/delete-area.use-case.impl';
import { DeriveDocumentUseCase } from '~/modules/gestion-documental/application/derive-document.use-case';
import { ReceiveDocumentUseCase } from '~/modules/gestion-documental/application/receive-document.use-case';
import { RejectDocumentUseCase } from '~/modules/gestion-documental/application/reject-document.use-case';
import { CancelDerivationUseCase } from '~/modules/gestion-documental/application/cancel-derivation.use-case';
import { JustifyDelayUseCase } from '~/modules/gestion-documental/application/justify-delay.use-case';
import { GroupDocumentsUseCase } from '~/modules/gestion-documental/application/group-documents.use-case';
import { ArchiveDocumentUseCase } from '~/modules/gestion-documental/application/archive-document.use-case';
import { UnarchiveDocumentUseCase } from '~/modules/gestion-documental/application/unarchive-document.use-case';
import { GetDocumentDetailsUseCase } from '~/modules/gestion-documental/application/get-document-details.use-case';
import { GetDocumentHistoryUseCase } from '~/modules/gestion-documental/application/get-document-history.use-case';
import { ListDocumentsUseCase } from '~/modules/gestion-documental/application/list-documents.use-case';
import { ListAreasUseCase } from '~/modules/gestion-documental/application/list-areas.use-case.impl';
import { RegisterDocumentUseCase } from '~/modules/gestion-documental/application/register-document.use-case.impl';
import { UpdateAreaUseCase } from '~/modules/gestion-documental/application/update-area.use-case.impl';
import { DrizzleAreaHierarchyRepository } from '~/modules/gestion-documental/infra/drizzle-area-hierarchy.repository';
import { DrizzleDocumentHistoryRepository } from '~/modules/gestion-documental/infra/drizzle-document-history.repository';
import { DrizzleDocumentRepository } from '~/modules/gestion-documental/infra/drizzle-document.repository';

import { DrizzleUserRepository } from '~/modules/users/infra/drizzle-user.repository';
import { CreateUserUseCase } from '~/modules/users/application/create-user.use-case';
import { UpdateUserUseCase } from '~/modules/users/application/update-user.use-case';
import { DeleteUserUseCase } from '~/modules/users/application/delete-user.use-case';
import { ListUsersUseCase } from '~/modules/users/application/list-users.use-case';

import { DrizzleRoleRepository } from '~/modules/roles/infra/drizzle-role.repository';
import { DrizzlePermissionRepository } from '~/modules/roles/infra/drizzle-permission.repository';
import { ListRolesUseCase } from '~/modules/roles/application/list-roles.use-case';
import { CreateRoleUseCase } from '~/modules/roles/application/create-role.use-case';
import { UpdateRoleUseCase } from '~/modules/roles/application/update-role.use-case';
import { DeleteRoleUseCase } from '~/modules/roles/application/delete-role.use-case';
import { ListAvailablePermissionsUseCase } from '~/modules/roles/application/list-available-permissions.use-case';

import { AuthorizationService } from '~/core/auth/authorization.service';
import { IStorageService } from '~/modules/storage/core/storage.service';
import { R2StorageService } from '~/modules/storage/infra/r2.storage.service';

import { DrizzleDashboardRepository } from '~/modules/dashboard/infra/drizzle-dashboard.repository';
import { GetDashboardDataUseCase } from '~/modules/dashboard/application/get-dashboard-data.use-case';

import { db } from '~/db';

// Register DB client
container.register(InjectionTokens.DB, {
    useValue: db,
});

// Register Document Dependencies
container.register(InjectionTokens.DocumentRepository, {
    useClass: DrizzleDocumentRepository,
});
container.register(InjectionTokens.DocumentHistoryRepository, {
    useClass: DrizzleDocumentHistoryRepository,
});
container.register(InjectionTokens.AreaHierarchyRepository, {
    useClass: DrizzleAreaHierarchyRepository,
});
container.register(InjectionTokens.RegisterDocumentUseCase, {
    useClass: RegisterDocumentUseCase,
});
container.register(InjectionTokens.GetDocumentDetailsUseCase, {
    useClass: GetDocumentDetailsUseCase,
});
container.register(InjectionTokens.GetDocumentHistoryUseCase, {
    useClass: GetDocumentHistoryUseCase,
});
container.register(InjectionTokens.ListDocumentsUseCase, {
    useClass: ListDocumentsUseCase,
});
container.register(InjectionTokens.DeriveDocumentUseCase, {
    useClass: DeriveDocumentUseCase,
});
container.register(InjectionTokens.ReceiveDocumentUseCase, {
    useClass: ReceiveDocumentUseCase,
});
container.register(InjectionTokens.RejectDocumentUseCase, {
    useClass: RejectDocumentUseCase,
});
container.register(InjectionTokens.CancelDerivationUseCase, {
    useClass: CancelDerivationUseCase,
});
container.register(InjectionTokens.JustifyDelayUseCase, {
    useClass: JustifyDelayUseCase,
});
container.register(InjectionTokens.GroupDocumentsUseCase, {
    useClass: GroupDocumentsUseCase,
});
container.register(InjectionTokens.ArchiveDocumentUseCase, {
    useClass: ArchiveDocumentUseCase,
});
container.register(InjectionTokens.UnarchiveDocumentUseCase, {
    useClass: UnarchiveDocumentUseCase,
});

// Register Area CRUD Use Cases
container.register(InjectionTokens.CreateAreaUseCase, {
    useClass: CreateAreaUseCase,
});
container.register(InjectionTokens.ListAreasUseCase, {
    useClass: ListAreasUseCase,
});
container.register(InjectionTokens.UpdateAreaUseCase, {
    useClass: UpdateAreaUseCase,
});
container.register(InjectionTokens.DeleteAreaUseCase, {
    useClass: DeleteAreaUseCase,
});

// Register Users Dependencies
container.register(InjectionTokens.UserRepository, {
    useClass: DrizzleUserRepository,
});
container.register(InjectionTokens.LoginUseCase, {
    useClass: LoginUseCase,
});
container.register(InjectionTokens.AssignRoleUseCase, {
    useClass: AssignRoleUseCase,
});
container.register(InjectionTokens.ListUsersUseCase, {
    useClass: ListUsersUseCase,
});
container.register(InjectionTokens.CreateUserUseCase, {
    useClass: CreateUserUseCase,
});
container.register(InjectionTokens.UpdateUserUseCase, {
    useClass: UpdateUserUseCase,
});
container.register(InjectionTokens.DeleteUserUseCase, {
    useClass: DeleteUserUseCase,
});

// Register Roles & Permissions Dependencies
container.register(InjectionTokens.RoleRepository, {
    useClass: DrizzleRoleRepository,
});
container.register(InjectionTokens.PermissionRepository, {
    useClass: DrizzlePermissionRepository,
});
container.register(InjectionTokens.ListRolesUseCase, {
    useClass: ListRolesUseCase,
});
container.register(InjectionTokens.CreateRoleUseCase, {
    useClass: CreateRoleUseCase,
});
container.register(InjectionTokens.UpdateRoleUseCase, {
    useClass: UpdateRoleUseCase,
});
container.register(InjectionTokens.DeleteRoleUseCase, {
    useClass: DeleteRoleUseCase,
});
container.register(InjectionTokens.ListAvailablePermissionsUseCase, {
    useClass: ListAvailablePermissionsUseCase,
});
container.register(InjectionTokens.AuthorizationService, {
    useClass: AuthorizationService,
});

// Register Dashboard Dependencies
container.register(InjectionTokens.DashboardRepository, {
    useClass: DrizzleDashboardRepository,
});
container.register(InjectionTokens.GetDashboardDataUseCase, {
    useClass: GetDashboardDataUseCase,
});

// Register Storage Service
container.register<IStorageService>(InjectionTokens.StorageService, {
    useClass: R2StorageService,
});

export { container, InjectionTokens };