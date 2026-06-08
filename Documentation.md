# KONČNA DOKUMENTACIJA

# Daily Games Hub

**Skupina 1**\
Maribor, 8. 6. 2026\
**Mentor:** Grega Žlahtič

------------------------------------------------------------------------

# Kazalo

1.  Opis projekta
2.  Opis arhitekture
3.  Podatkovni model
4.  API dokumentacija
5.  Navodila za namestitev
6.  Navodila za uporabo
7.  Zaključek

------------------------------------------------------------------------

# 1. Opis projekta

## 1.1 Namen projekta

Daily Games Hub je spletna platforma za igranje in primerjanje dnevnih
logičnih, geografskih, matematičnih in zabavnih iger.

Projekt rešuje problem razpršenosti dnevnih iger po različnih spletnih
straneh.

## 1.2 Cilji sistema

-   Centralizacija dnevnih iger.
-   Registracija uporabnikov.
-   Sistem prijateljev.
-   Statistika in dosežki.
-   Samodejno generiranje dnevnih izzivov.

## 1.3 Ključne funkcionalnosti

### Upravljanje uporabnikov

-   Registracija.
-   Prijava.
-   JWT avtentikacija.
-   Upravljanje profila.
-   Nastavitve uporabnika.

### Dnevne igre

-   Wordle
-   Flagle
-   More/Less
-   Songless
-   Worldle
-   Math Sprint

### Socialne funkcionalnosti

-   Dodajanje prijateljev.
-   Sprejemanje prošenj.
-   Primerjava rezultatov.

### Statistika in dosežki

-   Globalne lestvice.
-   Dnevne, tedenske in mesečne lestvice.
-   Medalje.
-   Streaki.
-   Zgodovina igranja.

# 2. Opis arhitekture

## 2.1 Arhitekturni pregled

### Frontend

Tehnologije:

-   React
-   Vite
-   TypeScript
-   CSS

Odgovornosti:

-   uporabniški vmesnik
-   API komunikacija
-   validacija
-   upravljanje seje

### Backend

Tehnologije:

-   Express
-   TypeScript
-   JWT

Odgovornosti:

-   poslovna logika
-   avtentikacija
-   upravljanje uporabnikov
-   dnevni izzivi
-   statistika

### Podatkovni sloj

Tehnologija:

-   MongoDB

Odgovornosti:

-   shranjevanje podatkov
-   relacije
-   rezultati
-   statistike


# 3. Podatkovni model

## 3.1 Entiteta users

  Field                  Type     Required   Description
  ---------------------- -------- ---------- ------------------------
  \_id                   Number   Yes        Unique user identifier
  username               String   Yes        Display name
  email                  String   Yes        Email address
  password_hash          String   Yes        Password hash
  avatar_url             String   No         Avatar URL
  avatar_file_id         String   No         Uploaded avatar ID
  current_streak         Number   Yes        Current streak
  longest_streak         Number   Yes        Longest streak
  games_played           Number   Yes        Games played
  num_achievements       Number   Yes        Achievements
  global_rank            Number   Yes        Global rank
  created_at             Date     Yes        Created timestamp
  updated_at             Date     Yes        Updated timestamp
  resetPasswordToken     String   No         Reset token
  resetPasswordExpires   Date     No         Token expiry

## 3.2 users.achievements

  Field         Type     Required   Description
  ------------- -------- ---------- -------------------
  title         String   Yes        Achievement title
  description   String   No         Description
  unlockedAt    Date     No         Unlock date

## 3.3 users.friends

  Field   Type     Required
  ------- -------- ----------
  \_id    Number   Yes

## 3.4 users.games

  Field        Type      Required   Description
  ------------ --------- ---------- -------------
  \_id         Number    Yes        Primary key
  title        String    Yes        Game
  attempts     Number    Yes        Attempts
  timeTaken    Number    Yes        Seconds
  completed    Boolean   Yes        Completed
  datePlayed   Date      Yes        Date

## 3.5 Entiteta Game

  Field                Type      Required   Description
  -------------------- --------- ---------- --------------
  game_id              Number    Yes        Primary key
  name                 String    Yes        Game name
  description          String    No         Description
  max_attempts         Number    No         Max attempts
  time_limit_seconds   Number    No         Time limit
  is_active            Boolean   Yes        Enabled

## 3.6 DailyChallenge

  Field           Type     Required   Description
  --------------- -------- ---------- -------------
  gameType        String   No         Type
  date            String   No         YYYY-MM-DD
  challengeData   Mixed    No         Payload

## 3.7 GameResult

  Field             Type       Required   Description
  ----------------- ---------- ---------- -------------
  \_id              ObjectId   Yes        Primary key
  user_id           Number     Yes        User
  gameType          String     Yes        Game
  challenge_id      String     Yes        Challenge
  difficulty        String     No         Difficulty
  completed         Boolean    Yes        Finished
  attempts_used     Number     No         Attempts
  correct_answers   Number     No         Correct
  time_seconds      Number     No         Time
  score             Number     Yes        Score
  played_at         Date       Yes        Timestamp

## 3.8 Notification

  Field        Type      Required   Description
  ------------ --------- ---------- -------------------
  \_id         Number    Yes        Primary key
  user_id      Number    Yes        Recipient
  type         String    Yes        Notification type
  message      String    Yes        Message
  actor        String    No         Username
  action_url   String    No         Link
  read         Boolean   Yes        Read
  created_at   Date      Yes        Timestamp

# 4. API dokumentacija

## Countries API

`GET /api/countries`

## User API

-   GET /api/user/data
-   PUT /api/user/data/edit
-   GET /api/user/data/today
-   POST /api/user/data/game
-   GET /api/user/data/statistics
-   GET /api/user/leaderboard
-   POST /api/user/avatar/upload
-   GET /api/user/avatar
-   GET /api/user/avatar/:fileId

## Friends API

-   GET /api/friends/search/users
-   POST /api/friends/request
-   POST /api/friends/:friendshipId/status
-   GET /api/friends/1
-   GET /api/friends1/requests
-   GET /api/friends/1/requests/sent
-   DELETE /api/friends/{id}/request
-   DELETE /api/friends/{id}

## Games API

-   GET /api/games/active
-   GET /api/games/:id

## Leaderboard API

-   GET /api/leaderboard/daily
-   GET /api/leaderboard/weekly
-   GET /api/leaderboard/monthly

## Daily Challenge API

-   GET /api/game/:gameType/today
-   GET /api/game/:gameType/date/:date
-   GET /api/game/:gameType/played-today
-   POST /api/game/:gameType/result

## Statistics API

-   GET /api/stats/me
-   GET /api/stats/Leaderboard

## Authentication API

-   POST /api/user/register
-   POST /api/user/login
-   POST /api/user/logout
-   POST /api/user/forgot-password
-   POST /api/user/reset-password

### Protected endpointi

Authorization header:

    Authorization: Bearer <jwt_token>

# 5. Navodila za namestitev

Aplikacija:

https://frontend-4ckggfmn5-workspace5.vercel.app/

## Predpogoji

-   Node.js 18+
-   npm 9+

## Backend

``` bash
cd backend && npm install
npm run dev
```

http://localhost:3000

## Frontend

``` bash
cd frontend && npm install
npm run dev
```

http://localhost:5173

# 6. Navodila za uporabo

## Registracija

1.  Odpri registracijo.
2.  Vnesi podatke.
3.  Sistem preveri uporabnika.
4.  Račun se ustvari.

## Prijava

1.  Vnos podatkov.
2.  Preverjanje.
3.  JWT žeton.
4.  Začetna stran.

## Igranje

1.  Izberi igro.
2.  Dnevni izziv.
3.  Reševanje.
4.  Shranjevanje.
5.  Lestvice.

## Dodajanje prijateljev

1.  Poišči uporabnika.
2.  Pošlji prošnjo.
3.  Potrditev.
4.  Ustvarjanje povezave.

## Spremljanje statistik

-   zgodovina rezultatov
-   streaki
-   dosežki
-   primerjava
-   lestvice

## Obvestila

-   novi izzivi
-   novi prijatelji
-   medalje
-   streaki
-   spremembe lestvic

# 7. Zaključek

Daily Games Hub predstavlja sodobno spletno platformo za igranje dnevnih
iger s poudarkom na socialnih funkcionalnostih, statistični analizi in
tekmovalnosti.
