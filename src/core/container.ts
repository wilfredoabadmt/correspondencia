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
import { SignDocumentUseCase } from '~/modules/gestion-documental/application/sign-document.use-case';
import { VerifyDocumentUseCase } from '~/modules/gestion-documental/application/verify-document.use-case';
import { GenerateDocxTemplateUseCase } from '~/modules/gestion-documental/application/generate-docx-template.use-case';
import { GenerateRoutingSlipPdfUseCase } from '~/modules/gestion-documental/application/generate-routing-slip-pdf.use-case';
import { GenerateReportUseCase } from '~/modules/gestion-documental/application/generate-report.use-case';
import { DocxGeneratorService } from '~/modules/gestion-documental/infra/docx-generator.service';
import { PdfGeneratorService } from '~/modules/gestion-documental/infra/pdf-generator.service';
import { ExceljsExporterService } from '~/modules/gestion-documental/infra/exceljs-exporter.service';
import { ChangePasswordUseCase } from '~/modules/users/application/change-password.use-case';
import { ManageFavoritesUseCase } from '~/modules/users/application/manage-favorites.use-case';
import { DrizzleFavoriteRecipientsRepository } from '~/modules/users/infra/drizzle-favorite-recipients.repository';
import { GetDocumentDetailsUseCase } from '~/modules/gestion-documental/application/get-document-details.use-case';
import { GetDocumentHistoryUseCase } from '~/modules/gestion-documental/application/get-document-history.use-case';
import { ListDocumentsUseCase } from '~/modules/gestion-documental/application/list-documents.use-case';
import { ListAreasUseCase } from '~/modules/gestion-documental/application/list-areas.use-case.impl';
import { RegisterDocumentUseCase } from '~/modules/gestion-documental/application/register-document.use-case.impl';
import { UpdateAreaUseCase } from '~/modules/gestion-documental/application/update-area.use-case.impl';
import { DrizzleAreaHierarchyRepository } from '~/modules/gestion-documental/infra/drizzle-area-hierarchy.repository';
import { DrizzleDocumentHistoryRepository } from '~/modules/gestion-documental/infra/drizzle-document-history.repository';
import { DrizzleDocumentRepository } from '~/modules/gestion-documental/infra/drizzle-document.repository';
import { DrizzleExpedienteRepository } from '~/modules/gestion-documental/infra/drizzle-expediente.repository';
import { CreateExpedienteUseCase } from '~/modules/gestion-documental/application/create-expediente.use-case.impl';
import { ListExpedientesUseCase } from '~/modules/gestion-documental/application/list-expedientes.use-case.impl';
import { GetExpedienteDetailsUseCase } from '~/modules/gestion-documental/application/get-expediente-details.use-case.impl';
import { UpdateExpedienteUseCase } from '~/modules/gestion-documental/application/update-expediente.use-case.impl';
import { AssociateDocumentUseCase } from '~/modules/gestion-documental/application/associate-document.use-case.impl';
import { DisassociateDocumentUseCase } from '~/modules/gestion-documental/application/disassociate-document.use-case.impl';

import { DrizzleCiteConfigRepository } from '~/modules/gestion-documental/infra/drizzle-cite-config.repository';
import { GenerateNextCiteUseCase } from '~/modules/gestion-documental/application/generate-next-cite.use-case';
import { ManageCiteConfigsUseCase } from '~/modules/gestion-documental/application/manage-cite-configs.use-case';
import { GetPublicTrackingInfoUseCase } from '~/modules/gestion-documental/application/get-public-tracking-info.use-case';
import { RegisterExternalDocumentUseCase } from '~/modules/gestion-documental/application/register-external-document.use-case';
import { GenerateReceiptPdfUseCase } from '~/modules/gestion-documental/application/generate-receipt-pdf.use-case';
import { DrizzleProveidoCatalogRepository } from '~/modules/gestion-documental/infra/drizzle-proveido-catalog.repository';
import { DeriveMultidestinationDocumentUseCase } from '~/modules/gestion-documental/application/derive-multidestination-document.use-case';
import { ListProveidosUseCase } from '~/modules/gestion-documental/application/list-proveidos.use-case';
import { JacobitusRestService } from '~/modules/firma-digital/infra/jacobitus-rest.service';
import { TsaTimestampService } from '~/modules/firma-digital/infra/tsa-timestamp.service';
import { SignDocumentJacobitusUseCase } from '~/modules/gestion-documental/application/sign-document-jacobitus.use-case';

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
container.register(InjectionTokens.SignDocumentUseCase, {
    useClass: SignDocumentUseCase,
});
container.register(InjectionTokens.VerifyDocumentUseCase, {
    useClass: VerifyDocumentUseCase,
});
container.register(InjectionTokens.CiteConfigRepository, {
    useClass: DrizzleCiteConfigRepository,
});
container.register(InjectionTokens.GenerateNextCiteUseCase, {
    useClass: GenerateNextCiteUseCase,
});
container.register(InjectionTokens.ManageCiteConfigsUseCase, {
    useClass: ManageCiteConfigsUseCase,
});
container.register(InjectionTokens.GetPublicTrackingInfoUseCase, {
    useClass: GetPublicTrackingInfoUseCase,
});
container.register(InjectionTokens.RegisterExternalDocumentUseCase, {
    useClass: RegisterExternalDocumentUseCase,
});
container.register(InjectionTokens.GenerateReceiptPdfUseCase, {
    useClass: GenerateReceiptPdfUseCase,
});
container.register(InjectionTokens.ProveidoCatalogRepository, {
    useClass: DrizzleProveidoCatalogRepository,
});
container.register(InjectionTokens.DeriveMultidestinationDocumentUseCase, {
    useClass: DeriveMultidestinationDocumentUseCase,
});
container.register(InjectionTokens.ListProveidosUseCase, {
    useClass: ListProveidosUseCase,
});
container.register(InjectionTokens.JacobitusService, {
    useClass: JacobitusRestService,
});
container.register(InjectionTokens.TsaTimestampService, {
    useClass: TsaTimestampService,
});
container.register(InjectionTokens.SignDocumentJacobitusUseCase, {
    useClass: SignDocumentJacobitusUseCase,
});

// Register Expediente Dependencies
container.register(InjectionTokens.ExpedienteRepository, {
    useClass: DrizzleExpedienteRepository,
});
container.register(InjectionTokens.CreateExpedienteUseCase, {
    useClass: CreateExpedienteUseCase,
});
container.register(InjectionTokens.ListExpedientesUseCase, {
    useClass: ListExpedientesUseCase,
});
container.register(InjectionTokens.GetExpedienteDetailsUseCase, {
    useClass: GetExpedienteDetailsUseCase,
});
container.register(InjectionTokens.UpdateExpedienteUseCase, {
    useClass: UpdateExpedienteUseCase,
});
container.register(InjectionTokens.AssociateDocumentToExpedienteUseCase, {
    useClass: AssociateDocumentUseCase,
});
container.register(InjectionTokens.DisassociateDocumentFromExpedienteUseCase, {
    useClass: DisassociateDocumentUseCase,
});

container.register(InjectionTokens.DocxGeneratorService, {
    useClass: DocxGeneratorService,
});
container.register(InjectionTokens.PdfGeneratorService, {
    useClass: PdfGeneratorService,
});
container.register(InjectionTokens.ExcelExporterService, {
    useClass: ExceljsExporterService,
});
container.register(InjectionTokens.GenerateDocxTemplateUseCase, {
    useClass: GenerateDocxTemplateUseCase,
});
container.register(InjectionTokens.GenerateRoutingSlipPdfUseCase, {
    useClass: GenerateRoutingSlipPdfUseCase,
});
container.register(InjectionTokens.GenerateReportUseCase, {
    useClass: GenerateReportUseCase,
});
container.register(InjectionTokens.FavoriteRecipientsRepository, {
    useClass: DrizzleFavoriteRecipientsRepository,
});
container.register(InjectionTokens.ChangePasswordUseCase, {
    useClass: ChangePasswordUseCase,
});
container.register(InjectionTokens.ManageFavoritesUseCase, {
    useClass: ManageFavoritesUseCase,
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