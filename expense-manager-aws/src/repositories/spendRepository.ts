import { Spend } from "../models/spend"

export interface BaseRepositorySpend {
    createSpend(item: Record<string, string | number | null>): Promise<Spend | any>
    getSpends(): Promise<Spend[]>
}


export class FakeRepositorySpend implements BaseRepositorySpend {
    private static readonly FAKE_SPEND: Spend = Spend.newSpend(
        "Gasto falso",
        120,
        "Descripción falsa"
    )

    async createSpend(item: Record<string, string | number>): Promise<Spend | any> {
        return FakeRepositorySpend.FAKE_SPEND
    }

    async getSpends(): Promise<Spend[]> {
        console.log('getSpends called');
        console.log("FakeRepositorySpend.getSpends called",FakeRepositorySpend.FAKE_SPEND);
        
        return [FakeRepositorySpend.FAKE_SPEND, FakeRepositorySpend.FAKE_SPEND]
    }
}
