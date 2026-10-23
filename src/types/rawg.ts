export interface RAWGPlatform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface RAWGGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RAWGGame {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  rating: number;
  rating_top: number;
  metacritic: number | null;
  released: string | null;
  platforms?: RAWGPlatform[];
  genres?: RAWGGenre[];
}

export interface RAWGSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RAWGGame[];
}
