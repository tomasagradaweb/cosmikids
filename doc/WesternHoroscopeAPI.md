
# Western Horoscope API

The **`western_horoscope`** endpoint calculates a full Western natal horoscope in the **tropical zodiac**.  
It returns:

* **Planets & points** – position, speed, sign, house, retrograde flag (Sun … Pluto, Node, Chiron, Lilith, Part of Fortune, etc.).  
* **Houses 1 – 12** – sign and absolute degree of each cusp.  
* **Sensitive points** – Ascendant, Mid‑Heaven (MC), Vertex, Lilith (Black Moon).  
* **Aspects** – major aspects between planets/points, with exact orb and type.

---

## Endpoint

```text
POST https://json.astrologyapi.com/v1/western_horoscope
```

---

## Supported Languages

English · German · Japanese · French · Russian · Italian · Portuguese · Spanish  
*Specify with the `Accept-Language` header.*

---

## House Systems

`placidus` · `koch` · `porphyry` · `equal` · `whole_sign` · `topocentric` · `sripati` · `horizontal` · `campanus`

Default is **`placidus`**.

---

## Request Body

| Param          | Type    | Required | Description                                          | Example |
|----------------|---------|----------|------------------------------------------------------|---------|
| `day`          | int     | ✓        | Day of birth                                         | `10`    |
| `month`        | int     | ✓        | Month of birth                                       | `5`     |
| `year`         | int     | ✓        | Year of birth                                        | `1990`  |
| `hour`         | int     | ✓        | Hour (24‑h)                                          | `19`    |
| `min`          | int     | ✓        | Minute                                               | `55`    |
| `lat`          | float   | ✓        | Latitude (°N + / °S –)                               | `19.2056` |
| `lon`          | float   | ✓        | Longitude (°E + / °W –)                              | `25.2056` |
| `tzone`        | float   | ✓        | Time‑zone offset from UTC                            | `5.5`   |
| `house_type`   | string  | —        | House system (see list above)                        | `"placidus"` |
| `is_asteroids` | boolean | —        | `true` to include asteroid data                      | `false` |

---

## Example Response (abridged)

```json
{
  "planets": [
    {
      "name": "Sun",
      "full_degree": 275.6427,
      "norm_degree": 5.6427,
      "speed": 1.019,
      "is_retro": "false",
      "sign": "Capricorn",
      "house": 2
    },
    {
      "name": "Moon",
      "full_degree": 12.271,
      "norm_degree": 12.271,
      "speed": 13.5085,
      "is_retro": "false",
      "sign": "Aries",
      "house": 5
    }
    /* … Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Node, Chiron, Part of Fortune, etc. */
  ],
  "houses": [
    { "house": 1,  "sign": "Sagittarius", "degree": 240.71431 },
    { "house": 2,  "sign": "Capricorn",  "degree": 270.69055 }
    /* … houses 3‑12 … */
  ],
  "ascendant": 240.71431015862024,
  "midheaven": 156.92135925483103,
  "vertex": 118.53668227404134,
  "lilith": {
    "name": "Lilith",
    "full_degree": 134.6796,
    "norm_degree": 14.6796,
    "is_retro": "false",
    "sign": "Leo",
    "house": 9
  },
  "aspects": [
    {
      "aspecting_planet": "Sun",
      "aspected_planet": "Mercury",
      "type": "Conjunction",
      "orb": 2.66
    }
    /* … */
  ]
}
```

---

## Sample Request (JavaScript / jQuery)

```javascript
const api      = "western_horoscope";
const userId   = "<Your User Id>";
const apiKey   = "<Your Api Key>";
const language = "<Your Language>"; // default: "en"

const data = {
  day:   6,
  month: 1,
  year:  2000,
  hour:  7,
  min:   45,
  lat:   19.132,
  lon:   72.342,
  tzone: 5.5
};

const auth = "Basic " + btoa(`${userId}:${apiKey}`);

$.ajax({
  url:        `https://json.astrologyapi.com/v1/${api}`,
  method:     "POST",
  dataType:   "json",
  headers: {
    "Authorization":   auth,
    "Content-Type":    "application/json",
    "Accept-Language": language
  },
  data: JSON.stringify(data)
})
.then(resp => console.log(resp))
.catch(err  => console.error(err));
```
