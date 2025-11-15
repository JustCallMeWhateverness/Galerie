import { Stack } from "react-bootstrap";
import { useCurrency } from "../context/CurrencyContext";
import type { Customer } from "../interfaces/Customer";


export type AuctionInfo = {
  title: string;
  description: string;
  seller: Customer;
  pickupEnabled: boolean;
  freightEnabled: boolean;
  timeRemaining: string;
  pickupLocation?: string;
  freightPrice?: number;
  startBid: number;
  color: string;
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
    startBid,
    color } = info;

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
          <strong>Starting Price:</strong>&nbsp;{formatCurrency(startBid)}
        </div>

        <div>
          <strong>Artist:</strong>&nbsp;{seller.username}
        </div>

        <div>
          <strong>Color:</strong>&nbsp;<span className="text-capitalize">{color}</span>
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
