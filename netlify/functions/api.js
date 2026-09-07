// File: netlify/functions/api.js

exports.handler = async function(event, context) {
    // Hanya izinkan jalur POST (Standar Keamanan)
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // CORS agar web Front-End Bosku bisa ngobrol dengan Backend ini
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    try {
        // Menerima perintah dari web index.html Bosku
        const data = JSON.parse(event.body);

        // 🔥 API KEY RAHASIA BOSKU (Aman, tidak akan terlihat di browser user)
        const API_KEY = "83c973138b158bf33977be9fbe472d54";
        const API_URL = "https://djuragansosmed.com/api/v2";

        // Susun parameter untuk dikirim ke Djuragan Sosmed
        const payload = new URLSearchParams();
        payload.append("key", API_KEY);
        payload.append("action", data.action);

        // Jika perintahnya adalah "add" (Buat Pesanan Baru)
        if (data.action === "add") {
            payload.append("service", data.service);
            payload.append("link", data.link);
            payload.append("quantity", data.quantity);
        }
        // Jika perintahnya adalah "status" (Lacak Pesanan)
        else if (data.action === "status") {
            payload.append("order", data.order);
        }

        // Tembak server Djuragan Sosmed secara sembunyi-sembunyi
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload
        });

        const result = await response.json();

        // Kembalikan hasilnya (Daftar Layanan/Status Order) ke web Bosku
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Gagal terhubung ke pusat: " + error.message })
        };
    }
};
