import { client } from "@/lib/typesense";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const level = searchParams.get("level") || "";

    if (!query) {
        return NextResponse.json(
            { hits: [], found: 0, facet_counts:[] }
        );
    }

    // 构建过滤条件
    const filterParts: string[] = [];
    if (category) filterParts.push(`category:=${category}`);
    if (level) filterParts.push(`level:=${level}`);
    const filter_by = filterParts.join(" && ");

    const result = await client.collections("docs").documents().search({
        q: query,
        query_by: "title,content",
        query_by_weights: "2.1",    // 手动干预，title匹配权重是content的两倍
        highlight_full_fields: "title,content",
        facet_by: "category,level", // 统计每个分类有多少结果
        ...(filter_by && { filter_by }),
        per_page: 10,
    });

    return NextResponse.json(result);
}