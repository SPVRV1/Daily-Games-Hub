# DOKUMENTACIJA

**Daily Games Hub**

Skupina 1
Maribor, 8. 6. 2026
Mentor: Grega Žlahtič

---

## Kazalo

1. [Opis projekta](#1-opis-projekta)
   - 1.1 Namen projekta
   - 1.2 Cilji sistema
   - 1.3 Ključne funkcionalnosti
2. [Opis arhitekture](#2-opis-arhitekture)
   - 2.1 Arhitekturni pregled
3. [Podatkovni model](#3-podatkovni-model)
   - 3.1 Entiteta users
   - 3.2 Entiteta users.achievements
   - 3.3 Entiteta users.friends
   - 3.4 Entiteta users.games
   - 3.5 Entiteta Game
   - 3.6 Entiteta DailyChallenge
   - 3.7 Entiteta GameResult
   - 3.8 Entiteta Notification
4. [API dokumentacija](#4-api-dokumentacija)
   - 4.1 Countries API
   - 4.2 User API
   - 4.3 Friends API
   - 4.4 Games API
   - 4.5 Leaderboard API
   - 4.7 Daily Challenge API
   - 4.8 Statistics API
   - 4.9 Authentication API
5. [Navodila za namestitev](#5-navodila-za-namestitev)
6. [Navodila za uporabo](#6-navodila-za-uporabo)
7. [Zaključek](#7-zaključek)

---

## 1. Opis projekta

### 1.1 Namen projekta

Daily Games Hub je spletna platforma za igranje in primerjanje dnevnih logičnih, geografskih, matematičnih in zabavnih iger. Namen sistema je uporabnikom omogočiti dostop do več dnevnih iger na enem mestu ter ustvariti socialno okolje, kjer lahko spremljajo svoje rezultate, primerjajo uspešnost s prijatelji in tekmujejo na globalnih lestvicah.

Projekt rešuje problem razpršenosti dnevnih iger po različnih spletnih straneh. Namesto obiskovanja več različnih portalov uporabnik dostopa do vseh iger preko enotnega uporabniškega vmesnika.

### 1.2 Cilji sistema

Glavni cilji projekta so:

- Centralizacija dnevnih iger v enotnem sistemu.
- Omogočanje registracije in upravljanja uporabniških profilov.
- Vzpostavitev sistema prijateljev in primerjave rezultatov.
- Vodenje statistik, dosežkov in serij igranja (streaks).
- Samodejno generiranje dnevnih izzivov.

### 1.3 Ključne funkcionalnosti

**Upravljanje uporabnikov**

- Registracija novih uporabnikov.
- Prijava uporabnikov.
- Avtentikacija z JWT žetoni.
- Upravljanje uporabniškega profila.
- Spreminjanje uporabniških nastavitev.

**Dnevne igre**

Sistem vsebuje naslednje igre:

- Wordle
- Flagle
- More/Less
- Songless
- Worldle
- Math Sprint

Za vsako igro se dnevni izziv generira enkrat dnevno in je enak za vse uporabnike.

**Socialne funkcionalnosti**

- Dodajanje prijateljev.
- Sprejemanje in zavračanje prošenj za prijateljstvo.
- Primerjava rezultatov s prijatelji.
- Pregled uspešnosti posameznega prijatelja.

**Statistika in dosežki**

- Globalne lestvice.
- Dnevne, tedenske in mesečne uvrstitve.
- Medalje in dosežki.
- Evidenca streakov.
- Zgodovina igranja.

---

## 2. Opis arhitekture

### 2.1 Arhitekturni pregled

Sistem temelji na trislojni arhitekturi:

**Frontend**

Odgovoren za:
- prikaz uporabniškega vmesnika,
- komunikacijo z API strežnikom,
- validacijo uporabniških vnosov,
- upravljanje uporabniške seje.

Uporabljena tehnologija:
- React
- Vite
- TypeScript
- CSS

**Backend**

Odgovoren za:
- Glavno logiko aplikacije,
- avtentikacijo in avtorizacijo,
- upravljanje uporabnikov,
- generiranje dnevnih izzivov in iger,
- izračun statistik.

Uporabljena tehnologija:
- Express
- TypeScript
- JWT

**Podatkovni sloj**

Odgovoren za:
- trajno shranjevanje podatkov,
- relacije med uporabniki,
- rezultate iger,
- statistike.

Predlagana tehnologija:
- MongoDB

---

## 3. Podatkovni model

### 3.1 Entiteta users

| Field | Type | Required | Description |
|---|---|---|---|
| _id | Number | Yes | Unique user identifier (primary key) |
| username | String | Yes | Display name |
| email | String | Yes | Email address |
| password_hash | String | Yes | Password hash |
| avatar_url | String | No | URL to profile avatar image |
| avatar_file_id | String | No | File ID for uploaded avatar |
| current_streak | Number | Yes | Current daily play streak |
| longest_streak | Number | Yes | All-time longest streak |
| games_played | Number | Yes | Total games played count |
| num_achievements | Number | Yes | Total achievements unlocked |
| global_rank | Number | Yes | Global leaderboard rank |
| created_at | Date | Yes | Account creation timestamp |
| updated_at | Date | Yes | Last profile update timestamp |
| resetPasswordToken | String | No | Token for password reset flow |
| resetPasswordExpires | Date | No | Expiry for the reset token |

### 3.2 Entiteta users.achievements

| Field | Type | Required | Description |
|---|---|---|---|
| title | String | Yes | Achievement title |
| description | String | No | What the achievement is for |
| unlockedAt | Date | No | When it was unlocked |

### 3.3 Entiteta users.friends

| Field | Type | Required | Description |
|---|---|---|---|
| _id | Number | Yes | User ID of the friend |

### 3.4 Entiteta users.games

| Field | Type | Required | Description |
|---|---|---|---|
| _id | Number | Yes | Primary key |
| title | String | Yes | Game name/type |
| attempts | Number | Yes | Number of attempts used |
| timeTaken | Number | Yes | Time taken in seconds |
| completed | Boolean | Yes | Whether the game was completed |
| datePlayed | Date | Yes | Date the game was played |

### 3.5 Entiteta Game

| Field | Type | Required | Description |
|---|---|---|---|
| game_id | Number | Yes | Primary key |
| name | String | Yes | Game name — one of: wordle, flagle, worldle, moreless, songless, mathsprint |
| description | String | No | Human-readable description |
| max_attempts | Number | No | Max allowed attempts (null = unlimited) |
| time_limit_seconds | Number | No | Time limit in seconds (null = untimed) |
| is_active | Boolean | Yes | Whether the game is currently enabled |

### 3.6 Entiteta DailyChallenge

| Field | Type | Required | Description |
|---|---|---|---|
| gameType | String | No | Type of challenge |
| date | String | No | Date string for this challenge (YYYY-MM-DD) |
| challengeData | Mixed | No | Flexible payload — structure varies by game type |

### 3.7 Entiteta GameResult

| Field | Type | Required | Description |
|---|---|---|---|
| _id | ObjectId | Yes | Primary key |
| user_id | Number | Yes | References users._id |
| gameType | String | Yes | Name of the game played |
| challenge_id | String | Yes | ID of the challenge played (links to games.challenges) |
| difficulty | String | No | Difficulty level — one of: easy, medium, hard |
| completed | Boolean | Yes | Whether the user finished the challenge (default: false) |
| attempts_used | Number | No | How many attempts were made |
| correct_answers | Number | No | Number of correct answers (where applicable) |
| time_seconds | Number | No | Time taken to complete in seconds |
| score | Number | Yes | Final score (default: 0) |
| played_at | Date | Yes | Timestamp of play (default: now) |

### 3.8 Entiteta Notification

| Field | Type | Required | Description |
|---|---|---|---|
| _id | Number | Yes | Primary key |
| user_id | Number | Yes | References users._id — recipient of the notification |
| type | String | Yes | Notification type — one of: friend_request, game_played, new_record |
| message | String | Yes | Notification message text |
| actor | String | No | Username who triggered the notification |
| action_url | String | No | Optional deep-link URL for the notification |
| read | Boolean | Yes | Whether the user has read it (default: false) |
| created_at | Date | Yes | When the notification was created |

---

## 4. API dokumentacija

### 4.1 Countries API

```
GET /api/countries
```

### 4.2 User API

```
GET    /api/user/data                  # Profil uporabnika
PUT    /api/user/data/edit             # Posodobitev profila
GET    /api/user/data/today            # Igre odigrane danes
POST   /api/user/data/game             # Shrani odigrano igro
GET    /api/user/data/statistics       # Podrobna statistika uporabnika
GET    /api/user/leaderboard           # Globalni leaderboard
POST   /api/user/avatar/upload         # Upload avatarja
GET    /api/user/avatar                # Avatar trenutnega uporabnika
GET    /api/user/avatar/:fileId        # Javni dostop do avatarja
```

### 4.3 Friends API

```
GET    /api/friends/search/users               # Iskanje uporabnikov
POST   /api/friends/request                    # Pošiljanje prošnje
POST   /api/friends/:friendshipId/status       # Sprejem/zavrnitev prošnje
GET    /api/friends/1                          # Seznam prijateljev
GET    /api/friends1/requests                  # Seznam prejetih prošenj
GET    /api/friends/1/requests/sent            # Seznam poslanih prošenj
DELETE /api/friends/{id}/request               # Zavrni prošnjo
DELETE /api/friends/{id}                       # Odstrani prijatelja
```

### 4.4 Games API

```
GET    /api/games/active       # Seznam vseh iger / seznam vseh aktivnih iger
GET    /api/games/:id          # Vrne podatke o posamezni igri
```

### 4.5 Leaderboard API

```
GET    /api/leaderboard/daily      # Dnevna lestvica
GET    /api/leaderboard/weekly     # Tedenska lestvica
GET    /api/leaderboard/monthly    # Mesečna lestvica
```

### 4.7 Daily Challenge API

```
GET    /api/game/:gameType/today               # Pridobitev današnjega izziva
GET    /api/game/:gameType/date/:date          # Pridobitev izziva za določen datum
GET    /api/game/:gameType/played-today        # Preveri ali je uporabnik danes že igral
POST   /api/game/:gameType/result              # Shrani rezultat igre
```

### 4.8 Statistics API

```
GET    /api/stats/me             # Vrne statistiko prijavljenega uporabnika
GET    /api/stats/Leaderboard    # Vrne globalni leaderboard
```

### 4.9 Authentication API

```
POST   /api/user/register
POST   /api/user/login
POST   /api/user/logout
POST   /api/user/forgot-password
POST   /api/user/reset-password
```

**Protected endpointi**

```
GET    /api/game/:gameType/played-today
POST   /api/game/:gametype/result
GET    /api/stats/me
```

Header:
```
Authorization: Bearer <jwt_token>
```

---

## 5. Navodila za namestitev

Aplikacija je dostopna na strežniku brez dodatnih namestitev:
https://frontend-4ckggfmn5-workspace5.vercel.app/

### 5.1 Predpogoji

Za delovanje sistema so potrebni:

- Node.js 18+
- Npm 9+

### 5.3 Namestitev zalednega dela

V paketu namestite potrebne odvisnosti:

```bash
cd backend && npm install
```

Zagon backenda (port 3000):

```bash
cd backend
npm run dev
```

Backend dev server: http://localhost:3000

### 5.4 Namestitev uporabniškega vmesnika

V paketu namestite potrebne odvisnosti:

```bash
cd frontend && npm install
```

Zagon frontenda (port 5173):

```bash
cd frontend
npm run dev
```

Frontend dev server: http://localhost:5173

---

## 6. Navodila za uporabo

### 6.1 Registracija

1. Uporabnik odpre registracijsko stran.
2. Vnese uporabniško ime in geslo.
3. Sistem preveri unikatnost uporabniškega imena.
4. Ustvari se uporabniški račun.

### 6.2 Prijava

1. Uporabnik vnese uporabniško ime in geslo.
2. Sistem preveri podatke.
3. Uporabnik prejme JWT žeton.
4. Odpre se začetna stran.

### 6.3 Igranje dnevnih iger

1. Uporabnik izbere želeno igro.
2. Naloži se dnevni izziv.
3. Uporabnik rešuje nalogo.
4. Rezultat se shrani v sistem.
5. Rezultat se prikaže na lestvicah.

### 6.4 Dodajanje prijateljev

1. Uporabnik poišče drugega uporabnika.
2. Pošlje prošnjo za prijateljstvo.
3. Prejemnik prošnjo potrdi.
4. Ustvari se povezava med uporabnikoma.

### 6.5 Spremljanje statistik

Uporabnik lahko:

- spremlja svojo zgodovino rezultatov,
- pregleduje streake,
- spremlja dosežke,
- primerja rezultate s prijatelji,
- spremlja globalne lestvice.

### 6.6 Obvestila

Sistem uporabnika samodejno obvešča o:

- novih dnevnih izzivih,
- novih prijateljih,
- pridobljenih medaljah,
- doseženih streakih,
- spremembah na lestvicah.

---

## 7. Zaključek

Daily Games Hub predstavlja sodobno spletno platformo za igranje dnevnih iger z močnim poudarkom na socialnih funkcionalnostih, statistični analizi in tekmovalnosti. Sistem je zasnovan modularno, kar omogoča enostavno dodajanje novih iger, funkcionalnosti in integracij z zunanjimi podatkovnimi viri. Arhitektura zagotavlja visoko razširljivost, varnost in vzdrževanje sistema tudi ob večjem številu uporabnikov.
