import type { CollectionCreateSchema } from "typesense";

export const docSchema: CollectionCreateSchema = {
    name: "docs",
    fields: [
        {
            name: "title",
            type: "string",
        },
        {
            name: "content",
            type: "string",
        },
        {
            name: "category",
            type: "string",
            facet: true,    // 后面做左侧筛选栏
        },
        {
            name: "level",
            type: "string",
            facet: true,
        },
        {
            name: "url",
            type: "string",
            index: false,   // 不会建立索引
        }
    ],
    default_sorting_field: ""
}