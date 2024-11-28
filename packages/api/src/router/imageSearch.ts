import dotenv from "dotenv";
import fetch from "node-fetch";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

// Environment Variables
// const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
const FLICKR_API_KEY = process.env.FLICKR_API_KEY || "";
const FLICKR_API_SECRET = process.env.FLICKR_API_SECRET || "";
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_API_KEY || "";
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || "";

// Load environment variables
dotenv.config();

// Type Definitions
interface ImageResponse {
  id: string;
  url: string;
  title?: string;
  alt?: string;
  license: string;
  photographer?: string;
}

// Comprehensive License Mapping
const licenseMap = {
  "0": "All Rights Reserved",
  "1": "Attribution-NonCommercial-ShareAlike License (CC BY-NC-SA)",
  "2": "Attribution-NonCommercial License (CC BY-NC)",
  "3": "Attribution-NonCommercial-NoDerivs License (CC BY-NC-ND)",
  "4": "Attribution License (CC BY)",
  "5": "Attribution-ShareAlike License (CC BY-SA)",
  "6": "Attribution-NoDerivs License (CC BY-ND)",
  "7": "No Known Copyright Restrictions",
  "8": "United States Government Work (Public Domain)",
};

// Expanded compatible domains with more specific sources
const compatibleDomains = [
  // Wikimedia and Open Archives
  "wikimedia.org",
  "commons.wikimedia.org",
  "upload.wikimedia.org",

  // Image Sharing Platforms
  "flickr.com",
  "unsplash.com",
  "pixabay.com",
  "pexels.com",

  // Government and Research Repositories
  "si.edu",
  "nasa.gov",
  "noaa.gov",
  "usgs.gov",
  "loc.gov",
  "archives.gov",

  // Cultural Institutions
  "metmuseum.org",
  "rijksmuseum.nl",
  "britishmuseum.org",

  // Open Content Platforms
  "creativecommons.org",
  "wordpress.org/openverse",
  "dp.la",

  // Scientific and Research Repositories
  "biodiversitylibrary.org",
  "esa.int",
  "europeana.eu",
];

// Input Validation Schema
const SearchInputSchema = z.object({
  searchExpression: z
    .string()
    .min(2, "Search term must be at least 2 characters")
    .max(100, "Search term too long"),
});

/**
 * Enhanced License Validation Function
 * @param item Search result item
 * @param source Source of the image
 * @returns Detected license information
 */
function validateLicense(item: any, source: string): string {
  const licenseKeywords = [
    "creative commons",
    "public domain",
    "attribution",
    "cc by",
    "cc0",
    "open license",
    "free to use",
    "no rights reserved",
  ];

  const text = `${item.title || ""} ${item.snippet || ""}`.toLowerCase();

  const matchedLicense = licenseKeywords.find((keyword) =>
    text.includes(keyword),
  );

  return matchedLicense
    ? `${source} - ${matchedLicense.toUpperCase()} License`
    : "License information not clearly available";
}

/**
 * Fetch Flickr Photo License Details
 * @param photoId Flickr Photo ID
 * @returns License information
 */
async function getPhotoLicense(photoId: string): Promise<string> {
  if (!FLICKR_API_KEY) {
    throw new Error("Flickr API Key is not configured");
  }

  const url = `https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${FLICKR_API_KEY}&photo_id=${photoId}&format=json&nojsoncallback=1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Flickr API error (getInfo): ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.photo || !data.photo.license) {
      return "Unknown License";
    }

    const licenseId: keyof typeof licenseMap = data.photo
      .license as keyof typeof licenseMap;
    return licenseMap[licenseId] || "Unknown License";
  } catch (error) {
    console.error(`Error fetching license for photo ${photoId}:`, error);
    return "Unknown License";
  }
}

/**
 * Google Image Search Service with Enhanced Features
 */
class GoogleImageSearchService {
  private apiKey: string;
  private cx: string;

  constructor(apiKey: string, cx: string) {
    if (!apiKey || !cx) {
      throw new Error("Google API Key or Search Engine ID is not set.");
    }
    this.apiKey = apiKey;
    this.cx = cx;
  }

  /**
   * Advanced Domain Compatibility Check
   * @param item Search result item
   * @returns Whether the domain is compatible
   */
  private isLicenseCompatible(item: any): boolean {
    const link = (item.link || "").toLowerCase();
    const displayLink = (item.displayLink || "").toLowerCase();

    return compatibleDomains.some((domain) => {
      const matchRegex = new RegExp(
        `https?://([^/]*\\.)?${domain.replace(/\./g, "\\.")}`,
        "i",
      );
      return matchRegex.test(link) || matchRegex.test(displayLink);
    });
  }

  /**
   * Search Images with Multiple Retry Mechanism
   * @param searchExpression Search query
   * @param retries Number of retries
   * @returns Array of Image Responses
   */
  async searchImages(
    searchExpression: string,
    retries = 2,
  ): Promise<ImageResponse[]> {
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("q", searchExpression);
    url.searchParams.set("searchType", "image");
    url.searchParams.set(
      "rights",
      "cc_publicdomain,cc_attribute,cc_sharealike",
    );
    url.searchParams.set("safe", "active");
    url.searchParams.set("imgColorType", "color");
    url.searchParams.set("imgSize", "medium");
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

      // Enhanced filtering and mapping
      const verifiedResults = data.items.filter(this.isLicenseCompatible).map(
        (item: any): ImageResponse => ({
          id: item.cacheId || item.link,
          url: item.link,
          title: item.title || "Untitled",
          license: validateLicense(item, "Google"),
          alt: item.snippet || "No description available",
        }),
      );

      return verifiedResults;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying Google image search. Attempts left: ${retries}`);
        return this.searchImages(searchExpression, retries - 1);
      }
      console.error("Error fetching images from Google:", error);
      throw new Error("Failed to fetch images from Google.");
    }
  }
}

/**
 * Simple Google Image Search Service
 */
class SimpleGoogleImageSearchService {
  private apiKey: string;
  private searchEngineId: string;

  constructor() {
    // Check if required environment variables are available
    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
      throw new Error("Google API configuration is incomplete");
    }
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  }

  /**
   * Verify if the rights parameter is valid
   * @param rights The rights parameter to verify
   * @returns boolean indicating if the rights parameter is valid
   */
  private isValidRights(rights: string): boolean {
    const validRights = [
      "cc_publicdomain",
      "cc_attribute",
      "cc_sharealike",
      "cc_noncommercial",
      "cc_nonderived",
    ];
    return validRights.includes(rights);
  }

  /**
   * Parse and validate the API response
   * @param data The API response data
   * @returns Validated image response array
   */
  private validateAndParseResponse(data: any): ImageResponse[] {
    if (!data || !data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid response format from Google API");
    }

    return data.items.map((item: any): ImageResponse => {
      if (!item.link) {
        throw new Error("Invalid image data: missing required fields");
      }

      return {
        id: item.link,
        url: item.link,
        title: item.title || "Untitled",
        alt: item.snippet || "No description available",
        license: this.detectLicense(item),
        photographer: item.image?.creator || undefined,
      };
    });
  }

  /**
   * Detect license information from image metadata
   * @param item Image item from API response
   * @returns Detected license string
   */
  private detectLicense(item: any): string {
    const rights = item.rights || "";

    if (rights.toLowerCase().includes("creative commons")) {
      return `Creative Commons - ${rights}`;
    } else if (rights.toLowerCase().includes("public domain")) {
      return "Public Domain";
    }

    return "Free to use with attribution";
  }

  /**
   * Perform an API-based image search with rights filtering
   * @param searchExpression Search query
   * @returns Array of Image Responses
   */
  async searchImages(searchExpression: string): Promise<ImageResponse[]> {
    try {
      // Construct the API URL with rights filtering
      const url = new URL("https://www.googleapis.com/customsearch/v1");
      url.searchParams.set("key", this.apiKey);
      url.searchParams.set("cx", this.searchEngineId);
      url.searchParams.set("q", searchExpression);
      url.searchParams.set("searchType", "image");
      url.searchParams.set(
        "rights",
        "cc_publicdomain,cc_attribute,cc_sharealike",
      );
      url.searchParams.set("safe", "active");

      // Verify all required parameters are set
      const requiredParams = ["key", "cx", "q", "searchType", "rights"];
      for (const param of requiredParams) {
        if (!url.searchParams.get(param)) {
          throw new Error(`Missing required parameter: ${param}`);
        }
      }

      // Make the API request
      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Google API error: ${response.statusText}. ${
            errorData.error?.message || ""
          }`,
        );
      }

      const data = await response.json();

      // Validate and parse the response
      return this.validateAndParseResponse(data);
    } catch (error) {
      console.error("Error in simple Google image search:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to perform simple Google image search",
      );
    }
  }
}

// Router Definition with Enhanced Procedures
export const imageSearch = router({
  getImagesFromUnsplash: protectedProcedure
    .input(SearchInputSchema)
    .mutation(async ({ input }): Promise<ImageResponse[]> => {
      const { searchExpression } = input;
      if (!UNSPLASH_ACCESS_KEY) {
        throw new Error("UNSPLASH_ACCESS_KEY is not set.");
      }

      try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          searchExpression,
        )}&per_page=10&content_filter=high`;

        const response = await fetch(url, {
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });

        if (!response.ok) {
          throw new Error(`Unsplash API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results.map((photo: any) => ({
          id: photo.id,
          url: photo.urls.full,
          photographer: photo.user.name,
          license: "Unsplash License (free for use, attribution recommended)",
          alt: photo.alt_description || "No description available",
          title: photo.description || "Untitled",
        }));
      } catch (error) {
        console.error("Error fetching images from Unsplash:", error);
        throw new Error("Failed to fetch images from Unsplash.");
      }
    }),

  getImagesFromFlickr: protectedProcedure
    .input(SearchInputSchema)
    .mutation(async ({ input }): Promise<ImageResponse[]> => {
      const { searchExpression } = input;

      if (!FLICKR_API_KEY || !FLICKR_API_SECRET) {
        throw new Error("FLICKR_API_KEY or FLICKR_API_SECRET is not set.");
      }

      try {
        const url = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${FLICKR_API_KEY}&text=${encodeURIComponent(
          searchExpression,
        )}&license=1,2,3,4,5,6,7&format=json&nojsoncallback=1&per_page=10`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Flickr API error: ${response.statusText}`);
        }

        const data = await response.json();
        const photos = data.photos.photo;

        const photosWithLicense = await Promise.all(
          photos.map(async (photo: any) => {
            const license = await getPhotoLicense(photo.id);
            return {
              id: photo.id,
              title: photo.title,
              url: `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`,
              license,
              alt: photo.title,
            };
          }),
        );

        return photosWithLicense;
      } catch (error) {
        console.error("Error fetching images from Flickr:", error);
        throw new Error("Failed to fetch images from Flickr.");
      }
    }),

  getImagesFromGoogle: protectedProcedure
    .input(SearchInputSchema)
    .mutation(async ({ input }): Promise<ImageResponse[]> => {
      const { searchExpression } = input;

      if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
        throw new Error("Google API configuration is incomplete.");
      }

      const searchService = new GoogleImageSearchService(
        GOOGLE_SEARCH_API_KEY,
        GOOGLE_SEARCH_ENGINE_ID,
      );

      return searchService.searchImages(searchExpression);
    }),

  simpleGoogleSearch: protectedProcedure
    .input(SearchInputSchema)
    .mutation(async ({ input }): Promise<ImageResponse[]> => {
      const { searchExpression } = input;

      // Note: This method doesn't require API keys
      const searchService = new SimpleGoogleImageSearchService();

      return searchService.searchImages(searchExpression);
    }),
});
