import fetch from "node-fetch";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

// Environment Variables
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
const FLICKR_API_KEY = "20284c97aa255ed16462b48d795674b5";
const FLICKR_API_SECRET = "e2ef5c0046daf760";
const UNSPLASH_ACCESS_KEY = "tw6-I8yQXuAN3SxdgZK4a99mw8oE-caT7ArdNooNgI4";
const UNSPLASH_APPLICATION_ID = "679714";
const UNSPLASH_SECRET = "EdxPE1Ko12IIKPx61jnpNHOEVsulZ0a_4UViQ6m8jVs";

// Type Definitions
interface ImageResponse {
  id: string;
  url: string;
  title?: string;
  alt?: string;
  license: string;
  photographer?: string;
}

// Helper class for Google Image Search
class GoogleImageSearchService {
  private apiKey: string;
  private cx: string;

  constructor(apiKey: string, cx: string) {
    if (!apiKey || !cx) {
      throw new Error("GOOGLE_API_KEY or GOOGLE_SEARCH_ENGINE_ID is not set.");
    }
    this.apiKey = apiKey;
    this.cx = cx;
  }

  private isLicenseCompatible(item: any): boolean {
    const compatibleDomains = [
      "wikimedia.org",
      "flickr.com",
      "commons.wikimedia.org",
      "creativecommons.org",
      "unsplash.com",
      "nasa.gov",
      "science.nasa.gov",
      "images.nasa.gov",
    ];

    const link = item.link || "";
    const displayLink = item.displayLink || "";

    return compatibleDomains.some(
      (domain) => link.includes(domain) || displayLink.includes(domain),
    );
  }

  async searchImages(searchExpression: string): Promise<ImageResponse[]> {
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("q", searchExpression);
    url.searchParams.set("searchType", "image");
    url.searchParams.set(
      "rights",
      "cc_publicdomain,cc_attribute,cc_sharealike",
    );
    url.searchParams.set("cx", this.cx);
    url.searchParams.set("key", this.apiKey);

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error(
          "Invalid response format from Google Custom Search API.",
        );
      }

      // Filter results based on compatible domains and map to ImageResponse
      const verifiedResults = data.items.filter(this.isLicenseCompatible).map(
        (item: any): ImageResponse => ({
          id: item.cacheId || item.link,
          url: item.link,
          title: item.title || "Untitled",
          license: this.determineLicense(item),
          alt: item.snippet || "No description available",
        }),
      );

      console.log(`Total results: ${data.items.length}`);
      console.log(`Verified results: ${verifiedResults.length}`);

      return verifiedResults;
    } catch (error) {
      console.error("Error fetching images from Google:", error);
      throw new Error("Failed to fetch images from Google.");
    }
  }

  private determineLicense(item: any): string {
    // Add more sophisticated license determination logic
    const licenseKeywords = [
      "creative commons",
      "public domain",
      "cc",
      "attribution",
    ];

    // Check if any license keywords are in the title or snippet
    const hasLicenseIndication = licenseKeywords.some(
      (keyword) =>
        (item.title || "").toLowerCase().includes(keyword) ||
        (item.snippet || "").toLowerCase().includes(keyword),
    );

    return hasLicenseIndication
      ? "Potentially open license"
      : "License information not clearly available";
  }
}

// Router Definition
export const imageSearch = router({
  // Pexels API
  // getImagesFromPexels: protectedProcedure
  //   .input(
  //     z.object({
  //       searchExpression: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ input }): Promise<ImageResponse[]> => {
  //     const { searchExpression } = input;

  //     // Initialize the Pexels SDK client
  //     const pexelsClient = createPexelsClient(PEXELS_API_KEY);
  //     if (!PEXELS_API_KEY) throw new Error("PEXELS_API_KEY is not set.");

  //     try {
  //       const response = await pexelsClient.photos.search({
  //         query: searchExpression,
  //         per_page: 10,
  //       });

  //       return response.photos.map((photo) => ({
  //         id: String(photo.id),
  //         url: photo.src.original,
  //         photographer: photo.photographer,
  //         license: "Free to use (Pexels License)",
  //         alt: photo.alt,
  //       }));
  //     } catch (error) {
  //       console.error("Error fetching images from Pexels:", error);
  //       throw new Error("Failed to fetch images from Pexels.");
  //     }
  //   }),

  // Wikimedia API
  // getImagesFromWikimedia: protectedProcedure
  //   .input(
  //     z.object({
  //       searchExpression: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ input }): Promise<ImageResponse[]> => {
  //     const { searchExpression } = input;

  //     try {
  //       const response = await fetch(
  //         `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
  //           searchExpression,
  //         )}&srnamespace=6&prop=imageinfo&iiprop=url|extmetadata&format=json`,
  //       );

  //       if (!response.ok) {
  //         throw new Error(`Wikimedia API returned status: ${response.status}`);
  //       }

  //       const data = await response.json();

  //       console.log("^^^^^^data", data?.query);

  //       // Check if the `pages` property exists and is an object
  //       if (!data.query?.pages || typeof data.query.pages !== "object") {
  //         console.error("Unexpected Wikimedia API response structure:", data);
  //         return [];
  //       }

  //       const pageArray = Object.values(data.query.pages);

  //       console.log("*******", pageArray);

  //       return pageArray.map((page: any) => ({
  //         id: String(page.pageid),
  //         url: page.imageinfo?.[0]?.url || null, // Safeguard for missing URLs
  //         title: page.title || "Untitled",
  //         license:
  //           page.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value ||
  //           "Unknown",
  //       }));
  //     } catch (error) {
  //       console.error("Error fetching images from Wikimedia:", error);
  //       throw new Error(
  //         "An error occurred while fetching images from Wikimedia. Please try again later.",
  //       );
  //     }
  //   }),

  getImagesFromUnsplash: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }): Promise<ImageResponse[]> => {
      const { searchExpression } = input;

      if (!UNSPLASH_ACCESS_KEY) {
        throw new Error("UNSPLASH_ACCESS_KEY is not set.");
      }

      try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          searchExpression,
        )}&per_page=10`;

        const response = await fetch(url, {
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });
        if (!response.ok) {
          const errorDetails = await response.json();
          console.error("Unsplash API error details:", errorDetails);
          throw new Error(`Unsplash API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("data", data);

        if (!data.results || !Array.isArray(data.results)) {
          console.warn("Unexpected Unsplash API response format:", data);
          throw new Error("Invalid response format from Unsplash API.");
        }
        return data.results.map((photo: any) => ({
          id: photo.id,
          url: photo.urls.full,
          photographer: photo.user.name,
          license: "Unsplash License (free for use, attribution recommended)",
          alt: photo.alt_description || "No description available",
        }));

        // return [
        //   {
        //     id: "test",
        //     url: "test",
        //     photographer: "test",
        //     license: "Unsplash License (free for use, attribution recommended)",
        //     alt: "test",
        //   },
        // ];
      } catch (error) {
        // console.error("Error fetching images from Unsplash:", error);
        throw new Error("Failed to fetch images from Unsplash.");
      }
    }),

  getImagesFromFlickr: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }): Promise<ImageResponse[]> => {
      const { searchExpression } = input;

      if (!FLICKR_API_KEY || !FLICKR_API_SECRET) {
        throw new Error("FLICKR_API_KEY or FLICKR_API_SECRET is not set.");
      }

      try {
        // Build the API request URL
        const url = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${FLICKR_API_KEY}&text=${encodeURIComponent(
          searchExpression,
        )}&license=1,2,3,4,5,6,7&format=json&nojsoncallback=1&per_page=10`;

        // Fetch data from Flickr API
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Flickr API error: ${response.statusText}`);
        }

        const data = await response.json();

        return data.photos.photo.map((photo: any) => ({
          id: photo.id,
          title: photo.title,
          url: `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`,
          license: "Flickr Open License", // You can refine this with actual license info if available
        }));
      } catch (error) {
        console.error("Error fetching images from Flickr:", error);
        throw new Error("Failed to fetch images from Flickr.");
      }
    }),
  getImagesFromGoogle: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }): Promise<ImageResponse[]> => {
      const { searchExpression } = input;
      const GOOGLE_API_KEY = "AIzaSyC01Bx-B0Qd3SHBzRM8jaQnKdMttnZTxR0";
      const GOOGLE_SEARCH_ENGINE_ID = "e218059f9df9d4d75";

      const searchService = new GoogleImageSearchService(
        GOOGLE_API_KEY,
        GOOGLE_SEARCH_ENGINE_ID,
      );
      return searchService.searchImages(searchExpression);
    }),
});
