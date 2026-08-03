export const InjectionTokens = {
    DB: Symbol('DB'),
    // Gestion Documental
    DocumentRepository: Symbol('IDocumentRepository'),
    AreaHierarchyRepository: Symbol('IAreaHierarchyRepository'),
    RegisterDocumentUseCase: Symbol('IRegisterDocumentUseCase'),
    CreateAreaUseCase: Symbol('ICreateAreaUseCase'),
    ListAreasUseCase: Symbol('IListAreasUseCase'),
    UpdateAreaUseCase: Symbol('IUpdateAreaUseCase'),
    DeleteAreaUseCase: Symbol('IDeleteAreaUseCase'),
    GetDocumentDetailsUseCase: Symbol('IGetDocumentDetailsUseCase'),
    ListDocumentsUseCase: Symbol('IListDocumentsUseCase'),
    DeriveDocumentUseCase: Symbol('IDeriveDocumentUseCase'),
    DocumentHistoryRepository: Symbol('IDocumentHistoryRepository'),
    GetDocumentHistoryUseCase: Symbol('IGetDocumentHistoryUseCase'),
    // Auth & Users
    UserRepository: Symbol('IUserRepository'),
    LoginUseCase: Symbol('ILoginUseCase'),
    AssignRoleUseCase: Symbol('IAssignRoleUseCase'),
    ListUsersUseCase: Symbol('IListUsersUseCase'),
    CreateUserUseCase: Symbol('ICreateUserUseCase'),
    UpdateUserUseCase: Symbol('IUpdateUserUseCase'),
    DeleteUserUseCase: Symbol('IDeleteUserUseCase'),
    // Roles & Permissions
    RoleRepository: Symbol('IRoleRepository'),
    PermissionRepository: Symbol('IPermissionRepository'),
    ListRolesUseCase: Symbol('IListRolesUseCase'),
    CreateRoleUseCase: Symbol('ICreateRoleUseCase'),
    UpdateRoleUseCase: Symbol('IUpdateRoleUseCase'),
    DeleteRoleUseCase: Symbol('IDeleteRoleUseCase'),
    ListAvailablePermissionsUseCase: Symbol('IListAvailablePermissionsUseCase'),
    AuthorizationService: Symbol('AuthorizationService'),
    // Dashboard
    DashboardRepository: Symbol('IDashboardRepository'),
    GetDashboardDataUseCase: Symbol('IGetDashboardDataUseCase'),
    // Storage
    StorageService: Symbol('IStorageService'),
};
