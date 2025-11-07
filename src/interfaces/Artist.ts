export default interface Artist {
  id: string;
  title?: string;
  username?: string;
  workTitle?: string;
  favorited: boolean;
  href?: string;
  profileImage?: {
    paths: string[];
    mediaTexts?: string[];
  };
};