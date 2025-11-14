export interface PostView {
  id: string;
  path: string;
  title: string;
  category: string[];
  views: string;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface SourceDistribution {
  source: string;
  count: number;
}

export interface AnalyticsResponse {
  posts_views: PostView[];
  category_distribution: CategoryDistribution[];
  source_distribution: SourceDistribution[];
}