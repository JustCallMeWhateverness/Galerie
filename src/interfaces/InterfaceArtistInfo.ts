export default interface InterfaceArtistInfo {
  id: string;
  title: string;
  customer?: string;
  description: string;
  workTitle: string;
  profileImage?: {
    paths: string[];
    mediaTexts?: string[];
  };
}
