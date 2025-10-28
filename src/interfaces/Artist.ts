export default interface Artist {
  id: number;
  firstName: string;
  lastName: string;
  rating?: number | null;
  profession?: string;
  favorited: boolean;
};