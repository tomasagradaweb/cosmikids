# Planets Tropical API

The **`planets/tropical`** endpoint returns the current positions of the celestial bodies in the **tropical zodiac** system.  
Each object in the response contains:

| Field        | Meaning                                                 |
|--------------|---------------------------------------------------------|
| `name`       | Planet / point name (Sun, Moon, Mars, … Ascendant)      |
| `fullDegree` | Absolute zodiac degree (0 – 359.99 °)                   |
| `normDegree` | Degree within its sign (0 – 29.99 °)                    |
| `speed`      | Daily motion (°/day)                                    |
| `isRetro`    | `"true"` if retrograde                                  |
| `sign`       | Zodiac sign                                             |
| `house`      | Placidus (default) house number                         |

---

## Endpoint

```text
POST https://json.astrologyapi.com/v1/planets/tropical
```

---

## Supported Languages

English · German · Japanese · French · Russian · Italian · Portuguese · Spanish  
*Pass the desired code with the `Accept-Language` request header.*

---

## Request Body

| Param       | Type  | Required | Description                                         | Example  |
|-------------|-------|----------|-----------------------------------------------------|----------|
| `day`       | int   | ✓        | Day of birth                                        | `10`     |
| `month`     | int   | ✓        | Month of birth                                      | `5`      |
| `year`      | int   | ✓        | Year of birth                                       | `1990`   |
| `hour`      | int   | ✓        | Hour (24‑h)                                         | `19`     |
| `min`       | int   | ✓        | Minute                                             | `55`     |
| `lat`       | float | ✓        | Latitude (°N + / °S –)                              | `19.2056`|
| `lon`       | float | ✓        | Longitude (°E + / °W –)                             | `25.2056`|
| `tzone`     | float | ✓        | Time‑zone offset from UTC                           | `5.5`    |
| `house_type`| string| —        | House system (`placidus` default)<br>`koch` · `topocentric` · `poryphry` · `equal_house` · `whole_sign` | `"placidus"` |

---

## Example Response

```json
[
  {
    "name": "Sun",
    "fullDegree": 259.3692854715937,
    "normDegree": 19.369285471593685,
    "speed": 1.0163786145803477,
    "isRetro": "false",
    "sign": "Sagittarius",
    "house": 11
  },
  {
    "name": "Moon",
    "fullDegree": 113.01532109301493,
    "normDegree": 23.015321093014933,
    "speed": 13.422889565180862,
    "isRetro": "false",
    "sign": "Cancer",
    "house": 7
  },
  …
  {
    "name": "Ascendant",
    "fullDegree": 288.3761917494198,
    "normDegree": 18.376191749419775,
    "speed": 0,
    "isRetro": "false",
    "sign": "Capricorn",
    "house": 1
  }
]
```

*(Full list includes Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Rahu, Ketu and Ascendant.)*

---

## Sample Request (JavaScript / jQuery)

```javascript
const api      = "planets/tropical";
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
