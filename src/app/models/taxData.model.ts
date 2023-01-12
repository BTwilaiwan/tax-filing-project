export interface TAXDATA {
    filingType: string | undefined;
    month: string;
    year: string;
    saleAmount: number;
    taxAmount: number;
    surcharge: number;
    penalty: number;
    totalAmount: number;
}