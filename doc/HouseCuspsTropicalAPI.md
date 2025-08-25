
# House Cusps Tropical API

The **`house_cusps/tropical`** endpoint returns, for a given birth chart, the zodiac **sign** and **degree** of each of the twelve house cusps in the **tropical zodiac** system, plus the **Ascendant**, **Midheaven** and **Vertex** positions.

| Field          | Meaning / Notes                                                         |
|----------------|-------------------------------------------------------------------------|
| `houses`       | Array of 12 objects, one per house cusp                                 |
| `house`        | House number (1 – 12)                                                   |
| `sign`         | Zodiac sign occupying the cusp                                          |
| `degree`       | Absolute zodiac degree (0 – 359.99 °)                                   |
| `ascendant`    | Ecliptic degree of the Ascendant                                        |
| `midheaven`    | Ecliptic degree of the Mid‑Heaven (MC)                                  |
| `vertex`       | Ecliptic degree of the Vertex                                           |

---

## Endpoint

```text
POST https://json.astrologyapi.com/v1/house_cusps/tropical
```

---

## Supported Languages

English · German · Japanese · French · Russian · Italian · Portuguese · Spanish  
*Send the desired language code via the `Accept-Language` request header.*

---

## Request Body

| Param        | Type   | Required | Description                                              | Example |
|--------------|--------|----------|----------------------------------------------------------|---------|
| `day`        | int    | ✓        | Day of birth                                             | `10`    |
| `month`      | int    | ✓        | Month of birth                                           | `5`     |
| `year`       | int    | ✓        | Year of birth                                            | `1990`  |
| `hour`       | int    | ✓        | Hour (24‑h)                                              | `19`    |
| `min`        | int    | ✓        | Minute                                                   | `55`    |
| `lat`        | float  | ✓        | Latitude (°N + / °S –)                                   | `19.2056` |
| `lon`        | float  | ✓        | Longitude (°E + / °W –)                                  | `25.2056` |
| `tzone`      | float  | ✓        | Time‑zone offset from UTC                                | `5.5`   |
| `house_type` | string | —        | House system (`placidus` default)<br>`koch` · `topocentric` · `poryphry` · `equal_house` · `whole_sign` | `"placidus"` |

---

## Example Response

```json
{
  "houses": [
    { "house": 1,  "sign": "Cancer",     "degree": 114.19653 },
    { "house": 2,  "sign": "Leo",        "degree": 141.2691  },
    { "house": 3,  "sign": "Virgo",      "degree": 171.57387 },
    { "house": 4,  "sign": "Libra",      "degree": 203.53114 },
    { "house": 5,  "sign": "Scorpio",    "degree": 234.90372 },
    { "house": 6,  "sign": "Sagittarius","degree": 264.98561 },
    { "house": 7,  "sign": "Capricorn",  "degree": 294.19653 },
    { "house": 8,  "sign": "Aquarius",   "degree": 321.2691  },
    { "house": 9,  "sign": "Pisces",     "degree": 351.57387 },
    { "house": 10, "sign": "Aries",      "degree": 23.53114  },
    { "house": 11, "sign": "Taurus",     "degree": 54.90372  },
    { "house": 12, "sign": "Gemini",     "degree": 84.98561  }
  ],
  "ascendant": 138.21237548900893,
  "midheaven": 47.54697697669932,
  "vertex": 235.92360650178892
}
```

---

## Sample Request (JavaScript / jQuery)

```javascript
const api      = "house_cusps/tropical";
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
