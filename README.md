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

## 🚀 Jak uruchomić:

```bash
cd backend
python3 classifier_genius.py "Chmura zadanie.las" output.las
```

Lub:
```bash
cd backend
./run_genius.sh
```

## 📊 Wyniki:

| Klasa | Punktów | % |
|-------|---------|---|
| Ground | 105.9M | 38.2% |
| Bridge | 30.4M | 10.9% |
| Fence | 26.1M | 9.4% |
| Road | 19.0M | 6.8% |
| Water | 8.0M | 2.9% |
| **Razem sklasyfikowane** | **212M** | **76.4%** |

## 🔧 Wymagania:

```bash
pip install numpy laspy scikit-learn scipy
```

## 📖 Dokumentacja:

- `backend/README.md` - dokumentacja klasyfikatora
- `FINAL_RESULTS.md` - pełne wyniki z mapą kolorów

## 🎨 Wizualizacja:

Otwórz plik `classified_FINAL.ply` w CloudCompare:

```bash
cloudcompare classified_FINAL.ply
```

---

**Projekt**: CPK HackNation  
**Data**: 7 grudnia 2025  
**Status**: ✅ Zakończony sukcesem!
