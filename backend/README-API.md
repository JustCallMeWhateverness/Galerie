# Known issues

- The API might react differently if no Item of a Content Type has been created in the admin interface. Content picker fields might not work then.
  - **Workaround:** Create a item in the admin interface first, then create a item with the api. Then you should be free to remove the admin interface created item and still be able to create new items through the API.
- DateTime fields might not work on items added from API. Currently using the YYYY-mm-ddThh:mm:ssZ format.
  - They still work within the API though. No cause for panic.

# Auction

## POST

Post to `/api/Auction`
Currently a separate start bid field doesn't work. Instead it is a secret bid that the seller does.

```json
{
  "title": "api test",
  "description": "api test",
  "pickupEnabled": false,
  "freightEnabled": false,
  "startTime": "1111-11-11T10:17:32Z",
  "endTime": "1111-11-11T10:17:32Z",
  "seller": [
    {
      "id": "4jvcdw8kj7k061g0fvxm3ex0mq",
      "username": "Mats"
    }
  ],
  "auctionCategoryId": "4e46ntebep02mtbhwd4pa4d6cz",
  "items": [
    {
      "title": "startBid",
      "customerId": "4jvcdw8kj7k061g0fvxm3ex0mq",
      "amount": 200,
      "contentType": "Bid"
    }
  ]
}
```

## PUT for bidding

Must contain the previous bids and the new bid. Otherwise the bids will be overwritten. The full body of the auction doesn't need to be included, only the bag is necessary.
PUT to `/api/Auction/{id}`

```json
{
  "items": [
    {
      "title": "startBid",
      "customerId": "4jvcdw8kj7k061g0fvxm3ex0mq",
      "amount": 200,
      "contentType": "Bid"
    },
    {
      "title": "test1",
      "customerId": "4jvcdw8kj7k061g0fvxm3ex0mq",
      "amount": 300,
      "contentType": "Bid"
    },
    {
      "title": "another bid",
      "customerId": "4jvcdw8kj7k061g0fvxm3ex0mq",
      "amount": 400,
      "contentType": "Bid"
    }
  ]
}
```
