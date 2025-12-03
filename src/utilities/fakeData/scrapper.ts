/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";

const categories = ["Mobile", "Computer Hardware", "Monitor", "Books", "clothing", "furniture", "footwear", "cars", "toys", "foods"];
const IMAGES_PER_CATEGORY = 30;
const UNSPLASH_ACCESS_KEY = "TpGBIKP3WUQvtJElGKWMM4qA6QSe_cXstO9ONR0naUk";

// default save path (can override)
const SAVE_PATH = path.resolve(__dirname, "unsplash_images.json");;

if (!UNSPLASH_ACCESS_KEY) {
    console.error("Please set your UNSPLASH_ACCESS_KEY in environment variables!");
    process.exit(1);
}

async function fetchImagesForCategory(category: string): Promise<string[]> {
    const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(category)}&per_page=${IMAGES_PER_CATEGORY}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const data = await res.json();
    return data.results.map((img: any) => img.urls.small);
}

async function main() {
    const results: Record<string, string[]> = {};

    for (const category of categories) {
        console.log(`Fetching images for category: ${category}...`);
        results[category] = await fetchImagesForCategory(category);
    }

    // save to JSON file
    fs.writeFileSync(SAVE_PATH, JSON.stringify(results, null, 2), "utf-8");
    console.log(`Image URLs saved successfully at: ${SAVE_PATH}`);
}

main().catch((err) => {
    console.error("Error fetching images:", err);
});
