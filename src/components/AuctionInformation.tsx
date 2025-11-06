import { Stack } from "react-bootstrap";
import { useCurrency } from "../context/CurrencyContext";

export type AuctionInfo = {
  title: string;
  description: string;
  seller: string;
  pickupEnabled: boolean;
  freightEnabled: boolean;
  timeRemaining: string;
  pickupLocation?: string;
  freightPrice?: number;
  startBid?: number;

};

export function AuctionInformation({ info }: { info: AuctionInfo }) {
  const {
    title,
    description,
    seller,
    pickupEnabled,
    freightEnabled,
    timeRemaining,
    pickupLocation,
    freightPrice,
    startBid } = info;

  const { formatCurrency } = useCurrency()

  return (
    <section className="mt-1">
      <Stack gap={2}>


        <h1>{title}</h1>
        <div>{description}</div>
        <div>
          <strong>Time remaining:</strong>&nbsp;{timeRemaining}
        </div>
        <div>
          <strong>Starting Price:</strong>&nbsp;{startBid === undefined ? formatCurrency(399) : formatCurrency(startBid)}
        </div>

        <div>
          <strong>Artist:</strong>&nbsp;{seller}
        </div>

        {/* Only displays pickup and freight information if they're enabled. */}
        {pickupEnabled &&
          <div>
            <strong>Pickup Location:</strong> {!pickupLocation ? "Stockholm" : pickupLocation}
          </div>
        }
        {
          freightEnabled &&
          <div>
            <strong>Freight:</strong> {!freightPrice ? "200" : freightPrice} SEK
          </div>
        }

      </Stack>
    </section>
  );
}
