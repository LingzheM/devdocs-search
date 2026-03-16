import { client } from "@/lib/typesense";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query) {
        return NextResponse.json(
            { hits: [], found: 0 }
        );
    }

    const result = await client.collections("docs").documents().search({
        q: query,
        query_by: "title,content",
        highlight_full_fields: "title,content",
        per_page: 10,
    });

    return NextResponse.json(result);
}