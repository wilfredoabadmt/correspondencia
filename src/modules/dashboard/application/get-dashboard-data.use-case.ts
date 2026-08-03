import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import {
    type DashboardKpis,
    type IDashboardRepository,
    type RecentDocument,
} from '../core/dashboard.repository';

type GetDashboardDataUseCaseParams = {
    organizationId: string;
};

type GetDashboardDataUseCaseResult = {
    kpis: DashboardKpis;
    recentDocuments: RecentDocument[];
};

@injectable()
export class GetDashboardDataUseCase {
    private readonly RECENT_DOCUMENTS_LIMIT = 10;

    constructor(
        @inject(InjectionTokens.DashboardRepository)
        private readonly dashboardRepository: IDashboardRepository
    ) { }

    async execute({
        organizationId,
    }: GetDashboardDataUseCaseParams): Promise<GetDashboardDataUseCaseResult> {
        const [kpis, recentDocuments] = await Promise.all([
            this.dashboardRepository.getKpis({ organizationId }),
            this.dashboardRepository.getRecentDocuments({
                organizationId,
                limit: this.RECENT_DOCUMENTS_LIMIT,
            }),
        ]);

        return { kpis, recentDocuments };
    }
}