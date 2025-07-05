import { http, HttpResponse } from "msw";

const supabaseUrl = "https://api.supabase.com";

/**
 * @see https://mswjs.io/docs/basics/request-handler
 */
export const handlers = [
    // http.post('/posts', () => {
    //   return HttpResponse.json({ id: 'abc-123' })
    // }),
    // Intercepta a requisição de signup do Supabase
    http.post(`${supabaseUrl}/auth/v1/signup`, () => {
        // Retorna uma resposta de sucesso simulada
        return HttpResponse.json(
            {
                id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", // UUID de usuário simulado
                aud: "authenticated",
                role: "authenticated",
                email: "test@example.com",
                // ... outros campos que o Supabase retorna
            },
            { status: 200 },
        );
    }),

    // Intercepta a criação de uma nova construtora
    http.post(`${supabaseUrl}/rest/v1/construtoras`, async () => {
        // Retorna uma resposta de sucesso vazia, que é o comportamento
        // padrão do Supabase para inserções bem-sucedidas.
        return new HttpResponse(null, { status: 201 });
    }),

    // Intercepta a busca pelo usuário autenticado
    http.get(`${supabaseUrl}/auth/v1/user`, () => {
        return HttpResponse.json({
            id: "user-123-id",
            aud: "authenticated",
            role: "authenticated",
            email: "test@example.com",
        });
    }),

    // Intercepta a busca pelo perfil do usuário para obter o tenant_id
    http.get(`${supabaseUrl}/rest/v1/profiles`, () => {
        return HttpResponse.json([{ tenant_id: "tenant-abc-123" }]);
    }),

    // Intercepta a busca pela lista de construtoras para o select
    http.get(`${supabaseUrl}/rest/v1/construtoras`, () => {
        return HttpResponse.json([
            {
                id: "construtora-1-id",
                tipo: "pj",
                nome_razao_social: "Construtora Teste 1",
                documento: "11.111.111/0001-11",
            },
            {
                id: "construtora-2-id",
                tipo: "pf",
                nome_razao_social: "José da Silva",
                documento: "222.222.222-22",
            },
        ]);
    }),

    // Intercepta a criação de uma nova obra
    http.post(`${supabaseUrl}/rest/v1/obras`, async () => {
        return new HttpResponse(null, { status: 201 });
    }),
];
