export type Info = {
  title?: string;
  size: string;
  description: string;
  artist: string;
  pickupLocation: string;
  freight: string;
};

export function AuctionInformation({ info }: { info: Info }) {
  const { title, size, description, artist, pickupLocation, freight } = info;

  //TODO: Fetch real info from backend.
  return (
    <section className="mt-2">
      <h1>{title}</h1>
      <p>{description}</p>

      {/* TODO: lägg till time remaining högre upp på sidan */}
      <div className="mt-3">
        {/* <p className="mb-1">
          <strong>Size:</strong> {size}
        </p> */}
        <p className="mb-1">
          <strong>Artist:</strong> {artist}
        </p>
        <p className="mb-1">
          <strong>Pickup Location:</strong> {pickupLocation}
        </p>
        <p className="mb-1">
          <strong>Freight:</strong> Available
        </p>
      </div>
    </section>
  );
}
