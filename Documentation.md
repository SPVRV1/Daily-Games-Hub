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

---

## Kratek način zagona

1. Namesti odvisnosti v obeh mapah:
   - `cd frontend && npm install`
   - `cd backend && npm install`
2. Zaženi backend:
   - `cd backend && npm run dev`
3. Zaženi frontend:
   - `cd frontend && npm run dev`


