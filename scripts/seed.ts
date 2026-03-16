import { client } from '../lib/typesense'
import { docSchema } from '../lib/schema'
import docs from "../data/docs.json"

async function seed() {
    try {
        await client.collections("docs").delete();
        console.log("delete old collection.");
    } catch {
        console.log("old collection doesn't exist, create directly");
    }

    await client.collections().create(docSchema);
    console.log("collection created success");

    const result = await client.collections("docs")
    .documents().import(docs, { action: "create" });

    console.log("数据导入结果:");
    console.log(result);
}

seed().catch(console.error);