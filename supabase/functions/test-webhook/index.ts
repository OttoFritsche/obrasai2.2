import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getPreflightHeaders, getSecureCorsHeaders } from "../_shared/cors.ts";

console.log(`🚀 Function "test-webhook" up and running!`);

serve(async (req) => {
    const origin = req.headers.get("Origin");

    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: getPreflightHeaders(origin) });
    }

    try {
        const { url: webhookUrl } = await req.json();

        // URL validation
        if (!webhookUrl || !webhookUrl.startsWith("http")) {
            return new Response(
                JSON.stringify({
                    error: "URL de webhook inválida ou ausente.",
                }),
                {
                    status: 400,
                    headers: {
                        ...getSecureCorsHeaders(origin),
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const payload = {
            test: true,
            source: "ObrasAI-Webhook-Test",
            alert_type: "TESTE",
            message: "Esta é uma mensagem de teste do ObrasAI.",
            timestamp: new Date().toISOString(),
        };

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "ObrasAI-Alerts/1.0",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(
                `O servidor do webhook respondeu com o status: ${response.status} ${response.statusText}`,
            );
        }

        const responseData = await response.json().catch(() => response.text());

        return new Response(
            JSON.stringify({
                success: true,
                message: "Webhook testado com sucesso!",
                response: responseData,
            }),
            {
                headers: {
                    ...getSecureCorsHeaders(origin),
                    "Content-Type": "application/json",
                },
                status: 200,
            },
        );
    } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error("Erro ao testar webhook:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: {
                ...getSecureCorsHeaders(origin),
                "Content-Type": "application/json",
            },
            status: 500,
        });
    }
});
