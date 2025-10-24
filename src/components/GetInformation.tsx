export type Info = {
  title: string;
  size: string;
  description: string;
  artist: string;
  pickupLocation: string;
  freight: string;
};

export function GetInformation({ info }: { info: Info }) {
  const { title, size, description, artist, pickupLocation, freight } = info;

  //TODO: Fetch real info from backend.
  return (
    <>
      <h4>Hello</h4>
      <p>{title}</p>
      <p>{size}</p>
      <p>{description}</p>
      <p>{artist}</p>
      <p>{pickupLocation}</p>
      <p>{freight}</p>
    </>
  );
}
