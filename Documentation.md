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

### Prijatelji
- `POST /api/friends/request` - pošlji prošnjo za prijateljstvo
- `PATCH /api/friends/:friendshipId/status` - sprejmi ali zavrni prošnjo
- `GET /api/friends/:userId` - pridobi seznam prijateljev uporabnika
- `GET /api/friends/:userId/requests` - pridobi čakajoče prošnje za prijateljstvo
- `DELETE /api/friends/:friendshipId` - odstrani sprejeto prijateljstvo

### Statistika
- `GET /api/stats/user/:userId` - statistika posameznega uporabnika (streaki, povprecja, completion rate)
- `GET /api/stats/user/me` - statistika prijavljenega uporabnika (zahteva JWT)
- `GET /api/stats/leaderboard?period=day|week|month|all&limit=50` - globalna lestvica po skupnem rezultatu

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

| Funkcionalnost | Status | Opomba |
|---|---|---|
| Wordle (frontend + backend) | Končano | |
| Flagle (frontend + backend) | Končano | |
| Math Sprint frontend | Končano | Urejena navigacija, 3 znane težave |
| Math Sprint backend | Končano | Generator in točkovanje delujeta |
| Registracija in prijava | V razvoju | Fix bugov v teku |
| Uporabniški profil 2 | V razvoju | Avatarji, statistike, zavihki |
| Pisanje avtomatskih testov | Končano | |
| Dokumentacija | V razvoju | |
