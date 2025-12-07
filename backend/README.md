# 🚀 TURBO DBSCAN Classifier

## Najszybsza klasyfikacja chmury punktów - cel: ~30 sekund!

### 🎯 Użycie

```bash
cd backend
./run_turbo.sh model.las classified_TURBO.las
```

Lub bezpośrednio:
```bash
python3 classifier_turbo.py model.las classified_TURBO.las
```

### ⚡ Optymalizacje

1. **Agresywny sampling**: 0.3% punktów (zamiast 1-5%)
2. **KD-Tree**: Ultra szybka propagacja etykiet
3. **Duże epsilon**: Mniej klastrów = szybsze DBSCAN
4. **Batch processing**: Oszczędność pamięci
5. **Równoległość**: `-1` jobs w DBSCAN

### 📊 Parametry

Możesz dostosować w `classifier_turbo.py`:

- `eps=1.0` - większy = szybszy (mniej klastrów)
- `min_samples=3` - mniejszy = szybszy
- `sample_ratio=0.003` - mniejszy = szybszy (0.3%)

### �� Wyniki

Dla pliku ~10M punktów:
- ⏱️ Czas: **~30 sekund**
- 📉 Sampling: ~30k punktów
- 🔍 DBSCAN: ~3s
- 🔄 Propagacja: ~15s
- ✅ 15 klas ASPRS

### 📝 Klasy

| ID | Nazwa |
|----|-------|
| 1  | Unclassified |
| 2  | Ground |
| 3  | Low Vegetation |
| 4  | Medium Vegetation |
| 5  | High Vegetation |
| 6  | Building |
| 7  | Noise |
| 9  | Water |
| 17 | Bridge |
| 18 | Rail |
| 20 | Pole |
| 22 | Sign |
| 30 | Road |
| 31 | Sidewalk |
| 36 | Fence |

### 🔧 Wymagania

```bash
pip install numpy laspy scikit-learn scipy
```

### 📦 Pliki w projekcie

- `classifier_turbo.py` - główny klasyfikator (ULTRA FAST)
- `classifier_dbscan_mega.py` - backup (trochę wolniejszy)
- `run_turbo.sh` - skrypt uruchomieniowy
- `requirements.txt` - zależności
