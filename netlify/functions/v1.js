// File: netlify/functions/v1.js
// Ini adalah sistem API Provider milik KA TECH HUB

exports.handler = async function(event, context) {
    // Izinkan web orang lain menembak API ini (CORS)
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") { return { statusCode: 200, headers, body: "" }; }

    try {
        let requestData = {};
        if (event.body) { requestData = JSON.parse(event.body); }

        // API Key Master Bosku ke Pusat Djuragan (Dirahasiakan di Cloud)
        const MASTER_API_KEY = "83c973138b158bf33977be9fbe472d54";
        
        // 1. JIKA WEB ORANG LAIN MINTA DAFTAR LAYANAN (action: services)
        if (requestData.action === "services" || event.httpMethod === "GET") {
            
            const payload = new URLSearchParams();
            payload.append("key", MASTER_API_KEY);
            payload.append("action", "services");

            const response = await fetch("https://djuragansosmed.com/api/v2", {
                method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: payload
            });
            const data = await response.json();

            // Kita format ulang datanya dan NAIKKAN HARGA untuk web orang lain!
            if(Array.isArray(data)) {
                const apiProviderData = data.map(item => {
                    let hargaPusat = parseFloat(item.rate);
                    let markupApi = 0;
                    
                    // Bosku ambil untung khusus untuk API H2H (Harga Grosir)
                    if (hargaPusat < 200000) markupApi = 3000;       // Untung 3rb per transaksi API
                    else if (hargaPusat < 700000) markupApi = 10000; // Untung 10rb per transaksi API
                    else markupApi = 20000;                          // Untung 20rb per transaksi API

                    return {
                        service: item.service,
                        name: item.name + " [KATECH HUB VIP]",
                        category: item.category,
                        rate: String(Math.round(hargaPusat + markupApi)),
                        min: item.min,
                        max: item.max,
                        type: "Default"
                    };
                });

                return { statusCode: 200, headers, body: JSON.stringify(apiProviderData) };
            }
        }

        // 2. JIKA WEB ORANG LAIN KIRIM ORDERAN KE API BOSKU
        if (requestData.action === "add") {
            // Di level mahir nanti, di sini kita buat sistem cek Saldo API Key orang tersebut.
            // Untuk saat ini, kita tolak otomatis dengan pesan error profesional.
            return {
                statusCode: 401, headers,
                body: JSON.stringify({ error: "Invalid API Key or Insufficient Balance. Hubungi Admin KA TECH HUB." })
            };
        }

        return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid Action" }) };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Server Maintenance" }) };
    }
};
