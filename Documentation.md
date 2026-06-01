# Dokumentacija

## Ideja

Daily Games Hub je spletna stran, ki na enem mestu zbira več kratkih dnevnih iger. Namesto da bi vsak dan šel na 5 različnih spletnih strani, imaš vse igre na enem mestu, skupaj s prijatelji, s katerimi vsak dan primerjaš rezultate. Cilj je rešiti čim več dnevnih izzivov z čim manj poskusi in biti najboljši na lestvici med prijatelji.

Vsaka igra se ponovi enkrat na dan in je za vse igralce enaka. Ko se igra reši, se tvoj rezultat (število poskusov, čas) shrani in primerja z rezultati prijateljev.

---

## Tehnologije

### Frontend

- React
- Vite
- TypeScript
- HTML / CSS

### Backend

- Node.js
- Express
- TypeScript
- MongoDB

### Ostalo

- JWT avtentikacija za zaščito uporabniških zahtevkov
- bcrypt za varno hrambo gesel
- Nodemailer za pošiljanje e-pošte ob obnovitvi gesla

---

## Arhitektura

Aplikacija je zgrajena po ločeni arhitekturi:

- `frontend/` je klientska aplikacija, ki teče v brskalniku
- `backend/` je REST API strežnik, ki obdeluje podatke in upravlja s podatkovno bazo
- Backend uporablja MongoDB kot primarno shrambo za uporabnike, igre, rezultate in prijatelje

Komunikacija med frontendom in backendom poteka preko HTTP zahtevkov, kjer so nekateri endpointi zaščiteni z JWT žetonom.

---

## Struktura projekta

### Vrhnje mape

- `frontend/` - React aplikacija
- `backend/` - Express API strežnik

### Frontend

- `frontend/src/` - izvorna koda aplikacije
- `frontend/src/components/` - komponente UI-ja
- `frontend/src/pages/` - strani aplikacije
- `frontend/src/context/` - podatkovni konteksti
- `frontend/src/hooks/` - prilagojeni React hooki
- `frontend/public/` - statične datoteke in ikone

### Backend

- `backend/src/index.ts` - glavni vstopni strežnik
- `backend/src/routes/` - definicije API poti
- `backend/src/controllers/` - logika za obdelavo zahtevkov
- `backend/src/models/` - podatkovni modeli
- `backend/src/middleware/` - preverjanje avtentikacije
- `backend/src/utils/` - pomočne funkcije (avtentikacija, pošiljanje e-pošte, validacija)
- `backend/src/data/` - igre in podatkovne datoteke za nekatere izzive

---

## Implementirane funkcionalnosti

- uporabniška registracija in prijava
- avtentikacija z JWT žetonom
- pozabljeno geslo in reset gesla preko e-pošte
- pošiljanje rezultata igre na strežnik
- preverjanje, ali je uporabnik igro že igral danes
- upravljanje prijateljev (pošiljanje zahtevkov, sprejem, brisanje)
- prikaz aktivnih in vseh iger iz baze

---

## API endpointi

### Avtorizacija in uporabnik

- `POST /api/user/register` - registracija novega uporabnika
- `POST /api/user/login` - prijava in pridobitev JWT žetona
- `GET /api/user/data?id=<userId>` - pridobi podatke uporabnika (zahteva žeton)
- `POST /api/user/forgot-password` - zahteva resetiranje gesla po e-pošti
- `POST /api/user/reset-password` - nastavi novo geslo z žetonom

### Igre

- `GET /api/games/active` - seznam aktivnih iger
- `GET /api/games/all` - seznam vseh iger
- `GET /api/games/:id` - podrobnosti o določeni igri
- `GET /api/games/:gameType/today` - pridobi današnji izziv za izbrano igro
- `GET /api/games/:gameType/played-today` - preveri, ali je uporabnik igro danes že igral
- `POST /api/games/:gameType/result` - pošlje rezultat igre

### Statistika

- `GET /api/stats/me` - statistika prijavljenega uporabnika prek JWT (streaki, povprečja, zgodovina iger)
- `GET /api/stats/me?period=day|week|month|all&gameType=<ime_igre>` - filtrirana statistika za grafične prikaze
- `GET /api/stats/leaderboard` - lestvica vseh uporabnikov za frontend sortiranje

#### Minimalni response format

- `GET /api/stats/me`
  - `user`: osnovni podatki prijavljenega uporabnika
  - `filters`: aktivni filtri (`period`, `gameType`)
  - `stats`: `currentStreak`, `longestStreak`, `gamesPlayed`, `completedGames`, `completionRate`, `averageAttempts`, `averageTime`, `perGame`
  - `history`: seznam odigranih iger za grafe in best results
- `GET /api/stats/leaderboard`
  - `leaderboard`: sortirani uporabniki z `rank`, `username`, `current_streak`, `longest_streak`, `games_played`

### Prijatelji

- `POST /api/friends/request` - pošlji prošnjo za prijateljstvo
- `PATCH /api/friends/:friendshipId/status` - sprejmi ali zavrni prošnjo
- `GET /api/friends/:userId` - pridobi seznam prijateljev uporabnika
- `GET /api/friends/:userId/requests` - pridobi čakajoče prošnje za prijateljstvo
- `DELETE /api/friends/:friendshipId` - odstrani sprejeto prijateljstvo

---

## Kratek način zagona

1. Namesti odvisnosti v obeh mapah:
   - `cd frontend && npm install`
   - `cd backend && npm install`
2. Zaženi backend:
   - `cd backend && npm run dev`
3. Zaženi frontend:
   - `cd frontend && npm run dev`

---

## Sprint 2

### Nove funkcionalnosti

#### Igre

- **Wordle** – implementacija igre ugibanja besed (mreža 5 × 6); animacija razkrivanja rezultatov, zaslon za konec igre, sistem obvestil za neveljavne vnose; backend generira datoteko veljavnih besed in dnevno besedo
- **Flagle** – implementacija igre ugibanja zastave; možnost igranja iger iz preteklih 3 dni
- **Math Sprint** – deterministični generator 5 nalog na dan; lestvica težavnosti: easy | medium | hard; točkovanje: 100× pravilne + do 50 bonus točk

#### Testiranje

- Nastavitev testnega okolja
- Osnovni testi: registracija, prijava, profil
- Testiranje API endpointov
- Testiranje UI komponent z `useEffect` in Hooks
- Pomoč pri odkrivanju bugov

---

### Posodobljeni API endpointi

#### Wordle

- `GET /api/games/wordle/today` – pridobi današnjo besedo
- `GET /api/games/wordle/played-today` – preveri, ali je uporabnik igro danes že igral
- `POST /api/games/wordle/result` – pošlje rezultat (število poskusov)

#### Flagle

- `GET /api/games/flagle/today` – pridobi današnjo zastavo
- `GET /api/games/flagle/played-today` – preveri, ali je uporabnik igro danes že igral
- `POST /api/games/flagle/result` – pošlje rezultat
- `GET /api/games/flagle/history` – pridobi igre iz preteklih 3 dni

#### Math Sprint

- `GET /api/games/mathsprint/today` – pridobi današnjih 5 nalog
- `GET /api/games/mathsprint/played-today` – preveri, ali je uporabnik igro danes že igral
- `POST /api/games/mathsprint/result` – pošlje rezultat (točke, čas, težavnost)

---

### Posodobljena struktura projekta

#### Backend (dopolnitev)

- `backend/src/data/words.json` – seznam veljavnih besed za Wordle
- `backend/src/data/flags/` – podatki o zastavah za Flagle
- `backend/scripts/` – pomožni skripti (npr. generiranje besed)

#### Frontend (dopolnitev)

- `frontend/src/pages/WordlePage.tsx` – stran igre Wordle
- `frontend/src/pages/FlaglePage.tsx` – stran igre Flagle
- `frontend/src/pages/MathSprintPage.tsx` – stran igre Math Sprint
- `frontend/src/components/` – komponente posameznih iger (mreža, tipkovnica, zasloni za konec igre)

---

### Zagotavljanje kakovosti (QA)

V 2. sprintu je bila vzpostavljena osnovna infrastruktura za testiranje:

- Testno okolje konfigurirano ločeno od produkcijskega
- Pokritost testov: registracija in prijava, API endpointi, UI komponente z `useEffect` v Hooks

---

### Stanje ob koncu sprinta

| Funkcionalnost              | Status    | Opomba                             |
| --------------------------- | --------- | ---------------------------------- |
| Wordle (frontend + backend) | Končano   |                                    |
| Flagle (frontend + backend) | Končano   |                                    |
| Math Sprint frontend        | Končano   | Urejena navigacija, 3 znane težave |
| Math Sprint backend         | Končano   | Generator in točkovanje delujeta   |
| Registracija in prijava     | V razvoju | Fix bugov v teku                   |
| Uporabniški profil 2        | V razvoju | Avatarji, statistike, zavihki      |
| Pisanje avtomatskih testov  | Končano   |                                    |
| Dokumentacija               | V razvoju |                                    |

---

## Sprint 3

### Nove funkcionalnosti

#### Igre
- **Worldle** – implementacija igre ugibanja držav; logika za preverjanje vnešenih držav, filtriranje in validacija podatkovnih struktur; pravilno pretvarjanje GeoJSON podatkov v SVG prikaz siluet; podpora za različne velikostne razreze
- **Songless** – implementacija igre ugibanja pesmi; JSON baza s seznamom pesmi in funkcija za pridobitev dnevne pesmi; popravljen indeks datuma (zero-based value)
- **More/Less** – implementacija igre in logike za shranjevanje napredka ter dnevne igre

#### Uporabniški profil (3. del)
- **Frontend** – sistem dosežkov in medalj, streak-i, implementacija skupin in skupnih dosežkov; JWT token za posodabljanje slike profila; stran za globalno statistiko
- **Backend** – posodabljanje avatarjev, sprejem JWT tokena, endpoint za shranjevanje odigranih iger, leaderboard podatki za vse igre na dnevni ravni

#### Statistika
- **Frontend** – stran s podrobno statistiko: graf rezultatov skozi čas (po igri), win streak, najboljši rezultati, primerjava s povprečjem vseh uporabnikov; filtriranje po igri in časovnem obdobju
- **Backend** – endpointi za statistike, izračun streakov in povprečij; popravljeni backend za Math Sprint (Score, Time, Število vprašanj)

#### Obvestila
- **Frontend** – sistem obvestil v aplikaciji: dropdown z zadnjimi obvestili (nova prošnja prijatelja, prijatelj odigral igro, nov rekord); NotificationProvider za delovanje gumbov v dropdownu
- **Backend** – tabela `notifications` v bazi; logika za ustvarjanje obvestil ob relevantnih dogodkih; endpointi za pridobitev in dodajanje obvestil; povezava frontend–backend za obvestila

---

### Posodobljeni API endpointi

#### Worldle
- `GET /api/games/worldle/today` – pridobi današnjo državo
- `GET /api/games/worldle/played-today` – preveri, ali je uporabnik igro danes že igral
- `POST /api/games/worldle/result` – pošlje rezultat

#### Songless
- `GET /api/games/songless/today` – pridobi današnjo pesem
- `GET /api/games/songless/played-today` – preveri, ali je uporabnik igro danes že igral
- `POST /api/games/songless/result` – pošlje rezultat

#### More/Less
- `GET /api/games/moreless/today` – pridobi današnji izziv
- `GET /api/games/moreless/played-today` – preveri, ali je uporabnik igro danes že igral
- `POST /api/games/moreless/result` – pošlje rezultat

#### Statistika
- `GET /api/stats/:userId` – pridobi statistiko uporabnika
- `GET /api/stats/:userId/:gameType` – pridobi statistiko za določeno igro
- `GET /api/stats/leaderboard` – pridobi lestvico vseh uporabnikov

#### Obvestila
- `GET /api/notifications/:userId` – pridobi obvestila uporabnika
- `POST /api/notifications` – ustvari novo obvestilo
- `PATCH /api/notifications/:notificationId` – označi obvestilo kot prebrano

#### Dosežki in skupine
- `GET /api/achievements/:userId` – pridobi dosežke in medalje uporabnika
- `GET /api/groups/:userId` – pridobi skupine uporabnika
- `POST /api/groups` – ustvari novo skupino
- `GET /api/groups/:groupId/achievements` – pridobi skupne dosežke skupine

---

### Posodobljena struktura projekta

#### Backend (dopolnitev)
- `backend/src/data/countries.geojson` – GeoJSON podatki za Worldle
- `backend/src/data/songs.json` – seznam pesmi za Songless
- `backend/src/models/Notification.ts` – model obvestil
- `backend/src/models/Achievement.ts` – model dosežkov
- `backend/src/models/Group.ts` – model skupin
- `backend/src/routes/stats.ts` – poti za statistike
- `backend/src/routes/notifications.ts` – poti za obvestila
- `backend/src/routes/achievements.ts` – poti za dosežke

#### Frontend (dopolnitev)
- `frontend/src/pages/WorldlePage.tsx` – stran igre Worldle
- `frontend/src/pages/SonglessPage.tsx` – stran igre Songless
- `frontend/src/pages/MoreLessPage.tsx` – stran igre More/Less
- `frontend/src/pages/StatsPage.tsx` – stran s statistikami
- `frontend/src/context/NotificationProvider.tsx` – kontekst za obvestila
- `frontend/src/components/NotificationDropdown.tsx` – dropdown za obvestila

---

### Stanje ob koncu sprinta

| Funkcionalnost | Status | Opomba |
|---|---|---|
| Worldle (frontend + backend) | Končano | |
| Songless (frontend + backend) | Končano | Popravljen indeks datuma |
| More/Less (frontend + backend) | Končano | |
| Uporabniški profil 3 | Končano | Dosežki, streak-i, skupine |
| Statistika (frontend + backend) | Končano | |
| Obvestila (frontend + backend) | Končano | |
