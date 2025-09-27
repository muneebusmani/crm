import * as api from '@lib/api';

export interface CreateQuotationParams
{
    leadId: number;
    subject: string;
    message: string;
    quotationPrice: number;
}

export const dealersApi = {
    async createQuotation( params: CreateQuotationParams )
    {
        const response = await api.post( '/dealers/quotations', params );
        return response.data;
    },
    async getQuotations( leadId?: number )
    {
        const url = leadId ? `/dealers/quotations?leadId=${leadId}` : '/dealers/quotations';
        const response = await api.get( url );
        return response;
    },

    async getQuotation( id: number )
    {
        const response = await api.get( `/dealers/quotations/${id}` );
        return response;
    },
};
