# 🚀 CPK Point Cloud Classifier - GENIUS Edition

Automatyczna klasyfikacja chmur punktów (LAS) z eksportem do PLY.

## ✅ Status: GOTOWE!

- ✅ 277 milionów punktów sklasyfikowanych
- ✅ Czas: 2 min 10 sek
- ✅ 15 klas ASPRS
- ✅ Eksport do PLY z kolorami

## 📁 Pliki wynikowe:

- `classified_FINAL.las` (6.8GB) - pełna klasyfikacja
- `classified_FINAL.ply` (4.2GB) - z kolorami
- `FINAL_RESULTS.md` - szczegółowe wyniki

## 🧭 Uruchomienie całej aplikacji (backend + frontend)

### 1) Backend (Flask API)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python server.py  # uruchomi API na http://localhost:5000
```

- Uploady trafiają do `backend/uploads/`, wyniki do `backend/outputs/`.
- Endpointy:
  - POST `/api/upload` - wysyłka pliku LAS/LAZ i start klasyfikacji
  - GET `/api/status/<file_id>` - status zadania
  - GET `/api/stats/<file_id>` - statystyki klas
  - GET `/api/download/<file_id>` - pobranie sklasyfikowanego LAS

### 2) Frontend (Vite + React)

```bash
cd Frontend
npm install
npm run dev  # domyślnie http://localhost:5173
```

- Vite proxy w [`Frontend/vite.config.ts`](Frontend/vite.config.ts) przekierowuje `/api` na `http://localhost:5000`, więc backend musi działać równolegle.
- Główne ekrany i logika w [`Frontend/src/App.tsx`](Frontend/src/App.tsx).

### 3) Typowy flow

1. Uruchom backend: `python server.py` (port 5000).
2. Uruchom frontend: `npm run dev` (port 5173).
3. Otwórz przeglądarkę na `http://localhost:5173`.
4. Upuść plik `.las`/`.laz` w sekcji Upload.
5. Poczekaj na zakończenie klasyfikacji (status “View Results”).
6. Pobierz wynikowy LAS.

---

**Projekt**: CPK HackNation  
**Data**: 7 grudnia 2025  
**Autorzy**: [sokq44](https://github.com/sokq44), [Daniel-Marciniak-developer](https://github.com/Daniel-Marciniak-developer)