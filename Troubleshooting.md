## Problem

- Content Types med komplicerat innehåll får tomma numeriska fält om de skapas via API.
- Invalid fields provided på Content Picker Fields om man inte skapat en Content Item av den typen först.
- (mindre viktigt) DateTime fält i Content Items som skapats via API fylls inte i ordentligt i admin interfacet. Ser ok ut i API.

Har skapat Problem Auction Content type för att underlätta felsökning. Har tagit bort samtliga content items av den typen så felen ska framgå.

### Kontroll

Content type Numeric Test fungerar som tänkt.
Fält:

- Number (numeric)
- User (user picker)

Exempel POST till http://localhost:5173/api/NumericTest/

```json
{
  "user": [
    {
      "id": "4jvcdw8kj7k061g0fvxm3ex0mq",
      "username": "Mats"
    }
  ],
  "number": 49
}
```

### Exempel på problem

Content type för felsökning: Problem Auction.

Testar att skicka följande med POST till http://localhost:5173/api/ProblemAuction/

```json
{
  "seller": [
      {
        "id": "4jvcdw8kj7k061g0fvxm3ex0mq",
        "username": "Mats"
      }
    ],
"hasPickup": true,
"endTime": "2025-12-12T12:12:12Z",
"categoryId": "40245hnn28jep04c5nkdjyre5g"
}

// felmeddelande:
{
  "error": "Invalid fields provided",
  "invalidFields": [
    "categoryId"
  ],
  "validFields": [
    "endTime",
    "hasPickup",
    "id",
    "seller",
    "startBid",
    "title"
  ]
}

```

Efter att ha skapat en Problem Auction i admin interfacet kan jag skicka bodyn ovan och få success. En Post visar dock att startBid på Untitled är ett tomt objekt istället för en siffra.

```json
[
  {
    "id": "48mbzy7wn4srnwkvhdwf0bjpdz",
    "title": "Admin test",
    "startBid": 300,
    "seller": [
      {
        "id": "4d9pbmzn661x46z0n2r087ardh",
        "username": "Tindra"
      }
    ],
    "hasPickup": true,
    "endTime": "2025-11-19T10:11:00Z",
    "categoryId": "49c5s18f434t4w0yw5acxpbgwb"
  },
  {
    "id": "4npj48q2t0ff47yheywyse6wwy",
    "title": "Untitled",
    "startBid": {},
    "seller": [
      {
        "id": "4jvcdw8kj7k061g0fvxm3ex0mq",
        "username": "Mats"
      }
    ],
    "hasPickup": true,
    "endTime": "2025-12-12T12:12:12Z",
    "categoryId": "40245hnn28jep04c5nkdjyre5g"
  }
]
```

Problem jag inte tänkt så mycket på samtidigt: när jag öppnar auktionen som skapades via API fylls inte DateTime fältet i. Syns dock i API så gör ingen större skillnad.
