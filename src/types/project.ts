export type PublishedProject = {
  id: string;
  title: string;
  client: string;
  category: string;
  description: string | null;
  year: string | null;
  imageUrl: string;
  imageAlt: string;
  href: string | null;
  sortOrder: number;
};
