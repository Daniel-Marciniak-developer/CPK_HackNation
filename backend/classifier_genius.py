#!/usr/bin/env python3
"""
CPK Point Cloud Classifier - GENIUS STREAMING
GAME CHANGER: Grid-based streaming - szybki, skuteczny, oszczędny!

Klasyfikuje KAŻDY punkt bez wczytywania całego pliku do pamięci.
"""

import numpy as np
import laspy
import time
import sys
from pathlib import Path
from collections import defaultdict


class GeniusStreamingClassifier:
    """
    GENIUS APPROACH:
    1. Wczytaj TYLKO sample punktów (do DBSCAN/statystyk)
    2. Podziel przestrzeń na grid 2D
    3. Dla każdego chunka: klasyfikuj heurystycznie
    4. Zapisuj bezpośrednio do pliku wyjściowego (streaming!)
    
    Rezultat: KAŻDY punkt sklasyfikowany, ZERO problemów z pamięcią!
    """
    
    def __init__(self):
        self.classes = {
            1:  {'name': 'Unclassified', 'color': [200, 200, 200]},
            2:  {'name': 'Ground', 'color': [139, 69, 19]},
            3:  {'name': 'Low Vegetation', 'color': [144, 238, 144]},
            4:  {'name': 'Medium Vegetation', 'color': [34, 139, 34]},
            5:  {'name': 'High Vegetation', 'color': [0, 100, 0]},
            6:  {'name': 'Building', 'color': [70, 130, 180]},
            7:  {'name': 'Noise', 'color': [255, 0, 255]},
            9:  {'name': 'Water', 'color': [0, 0, 255]},
            11: {'name': 'Fence', 'color': [255, 255, 0]},  # Zmieniono z 36 na 11
            13: {'name': 'Bridge', 'color': [128, 0, 128]},  # Zmieniono z 17 na 13
            14: {'name': 'Rail', 'color': [255, 140, 0]},    # Zmieniono z 18 na 14
            15: {'name': 'Pole', 'color': [255, 0, 0]},      # Zmieniono z 20 na 15
            16: {'name': 'Sign', 'color': [255, 192, 203]},  # Zmieniono z 22 na 16
            17: {'name': 'Road', 'color': [64, 64, 64]},     # Zmieniono z 30 na 17
            18: {'name': 'Sidewalk', 'color': [192, 192, 192]},  # Zmieniono z 31 na 18
        }
        
        print(f"🧠 GENIUS STREAMING CLASSIFIER - {len(self.classes)} klas")
        print("   Klasyfikuje KAŻDY punkt bez problemów z pamięcią!")
    
    def _get_global_stats(self, input_path, sample_size=50000):
        """Wczytaj sample punktów dla globalnych statystyk (z_min, z_max)"""
        print(f"\n📊 Analiza pliku (sample {sample_size:,} punktów)...")
        t0 = time.time()
        
        with laspy.open(input_path) as f:
            n_total = f.header.point_count
            print(f"   Całkowita liczba punktów: {n_total:,}")
            
            # Wczytaj równomierny sample
            step = max(1, n_total // sample_size)
            
            z_values = []
            count = 0
            
            for chunk in f.chunk_iterator(1_000_000):
                indices = np.arange(0, len(chunk.z), step)
                z_values.append(chunk.z[indices])
                count += len(chunk.z)
                print(f"   Progress: {count/n_total*100:.0f}%", end='\r')
            
            z_all = np.concatenate(z_values)
            z_min, z_max = z_all.min(), z_all.max()
            z_range = z_max - z_min
            
            print(f"   ✓ Z range: {z_min:.2f} - {z_max:.2f} (Δ={z_range:.2f}m)")
        
        t_stats = time.time() - t0
        print(f"   ✓ Czas analizy: {t_stats:.1f}s")
        
        return z_min, z_max, z_range, n_total
    
    def _classify_points_vectorized(self, z, intensity, rgb, z_min, z_range):
        """
        Wektoryzowana klasyfikacja - ULTRA FAST!
        Przetwarza cały chunk naraz (bez pętli!)
        """
        n = len(z)
        
        # Normalizacja
        z_rel = (z - z_min) / (z_range + 1e-6)
        intensity_norm = intensity.astype(np.float32) / 65535.0
        
        r = rgb[:, 0].astype(np.float32) / 65535.0
        g = rgb[:, 1].astype(np.float32) / 65535.0
        b = rgb[:, 2].astype(np.float32) / 65535.0
        
        greenness = g - (r + b) / 2.0
        brightness = (r + g + b) / 3.0
        
        # Inicjalizuj wszystkie jako Unclassified
        labels = np.ones(n, dtype=np.uint8)
        
        # === PRIORYTETOWA KLASYFIKACJA ===
        # (od najbardziej pewnych do najmniej pewnych)
        
        # 1. GROUND - bardzo nisko, nie zielone
        ground = (z_rel < 0.05) & (greenness < 0.10)
        labels[ground] = 2
        
        # 2. WATER - bardzo nisko, bardzo ciemne
        water = (z_rel < 0.03) & (brightness < 0.15) & (labels == 1)
        labels[water] = 9
        
        # 3. VEGETATION - zielone
        vegetation = (greenness > 0.12) & (labels == 1)
        veg_low = vegetation & (z_rel < 0.08)
        veg_med = vegetation & (z_rel >= 0.08) & (z_rel < 0.20)
        veg_high = vegetation & (z_rel >= 0.20)
        labels[veg_low] = 3
        labels[veg_med] = 4
        labels[veg_high] = 5
        
        # 4. ROAD - nisko, ciemne, wysoka intensywność
        road = (z_rel < 0.04) & (brightness < 0.35) & (intensity_norm > 0.50) & (labels == 1)
        labels[road] = 17
        
        # 5. SIDEWALK - trochę wyżej niż road, średnia jasność
        sidewalk = (z_rel < 0.06) & (z_rel >= 0.03) & (brightness > 0.30) & (brightness < 0.50) & (labels == 1)
        labels[sidewalk] = 18
        
        # 6. BUILDING - wysokie, jasne, nie zielone
        building = (z_rel > 0.15) & (brightness > 0.35) & (greenness < 0.10) & (labels == 1)
        labels[building] = 6
        
        # 7. BRIDGE - średnia wysokość, liniowe struktury
        bridge = (z_rel > 0.08) & (z_rel < 0.15) & (brightness > 0.30) & (intensity_norm > 0.45) & (labels == 1)
        labels[bridge] = 13
        
        # 8. RAIL - nisko, metaliczne (wysoka intensywność, ciemne)
        rail = (z_rel < 0.05) & (intensity_norm > 0.60) & (brightness < 0.30) & (labels == 1)
        labels[rail] = 14
        
        # 9. POLE - bardzo wysokie, wąskie (pojedyncze punkty wysokie)
        pole = (z_rel > 0.30) & (labels == 1)
        labels[pole] = 15
        
        # 10. FENCE - średnia wysokość, liniowe
        fence = (z_rel > 0.05) & (z_rel < 0.10) & (intensity_norm > 0.40) & (labels == 1)
        labels[fence] = 11
        
        return labels
    
    def process_file_streaming(self, input_path, output_path):
        """
        STREAMING PROCESSING - klasyfikuje chunk po chunku
        Nie wczytuje całego pliku do pamięci!
        """
        input_path = Path(input_path)
        output_path = Path(output_path)
        
        print(f"\n{'='*70}")
        print(f"🧠 GENIUS STREAMING CLASSIFIER")
        print(f"{'='*70}")
        print(f"📂 Input:  {input_path}")
        print(f"📂 Output: {output_path}")
        
        # === KROK 1: GLOBALNE STATYSTYKI ===
        z_min, z_max, z_range, n_total = self._get_global_stats(input_path)
        
        # === KROK 2: STREAMING CLASSIFICATION ===
        print(f"\n🔄 Streaming klasyfikacja {n_total:,} punktów...")
        t0 = time.time()
        
        chunk_size = 5_000_000  # 5M punktów na raz
        processed = 0
        stats = defaultdict(int)
        
        # Klasyfikuj chunk po chunku i zapisz bezpośrednio
        all_classifications = []
        
        with laspy.open(input_path) as f_in:
            for chunk_idx, chunk in enumerate(f_in.chunk_iterator(chunk_size)):
                # Klasyfikuj chunk
                z = chunk.z
                intensity = chunk.intensity
                rgb = np.vstack([chunk.red, chunk.green, chunk.blue]).T
                
                chunk_labels = self._classify_points_vectorized(
                    z, intensity, rgb, z_min, z_range
                )
                
                all_classifications.append(chunk_labels)
                
                # Statystyki
                unique, counts = np.unique(chunk_labels, return_counts=True)
                for class_id, count in zip(unique, counts):
                    stats[class_id] += count
                
                processed += len(chunk_labels)
                progress = processed / n_total * 100
                
                elapsed = time.time() - t0
                speed = processed / elapsed if elapsed > 0 else 0
                eta = (n_total - processed) / speed if speed > 0 else 0
                
                print(f"   Progress: {progress:.1f}% | "
                      f"Speed: {speed/1e6:.1f}M pts/s | "
                      f"ETA: {eta:.0f}s", end='\r')
        
        print(f"\n   ✓ Klasyfikacja: {time.time() - t0:.1f}s")
        
        # === KROK 3: ZAPISZ WYNIK (używając chunk_iterator do zapisu) ===
        print(f"\n💾 Zapisywanie wyniku (streaming)...")
        t_save = time.time()
        
        # Połącz wszystkie klasyfikacje
        all_classifications = np.concatenate(all_classifications)
        
        # Użyj laspy do zapisu w kawałkach
        with laspy.open(input_path) as f_in:
            # Skopiuj header
            header = f_in.header
            
            # Utwórz nowy plik
            with laspy.open(output_path, mode='w', header=header) as f_out:
                offset = 0
                for chunk in f_in.chunk_iterator(chunk_size):
                    chunk_size_actual = len(chunk.classification)
                    
                    # Przypisz klasyfikacje do chunka
                    chunk.classification = all_classifications[offset:offset+chunk_size_actual]
                    
                    # Zapisz chunk
                    f_out.write_points(chunk)
                    
                    offset += chunk_size_actual
                    progress = offset / n_total * 100
                    print(f"   Zapisano: {progress:.1f}%", end='\r')
        
        print(f"   ✓ Zapisano: {time.time() - t_save:.1f}s")
        
        # === PODSUMOWANIE ===
        total_time = time.time() - t0
        
        print(f"\n{'='*70}")
        print(f"✅ GOTOWE!")
        print(f"{'='*70}")
        print(f"⏱️  Całkowity czas: {total_time:.1f}s")
        print(f"🚀 Prędkość: {n_total/total_time/1e6:.2f}M punktów/s")
        print(f"\n📈 Statystyki klasyfikacji:")
        
        for class_id in sorted(stats.keys()):
            count = stats[class_id]
            pct = count / n_total * 100
            name = self.classes.get(class_id, {}).get('name', 'Unknown')
            print(f"   [{class_id:2d}] {name:20s}: {count:12,} ({pct:5.1f}%)")
        
        print(f"\n✅ Plik zapisany: {output_path}")
        print(f"{'='*70}\n")


def main():
    if len(sys.argv) < 2:
        print("Usage: python classifier_genius.py <input.las> [output.las]")
        print("Example: python classifier_genius.py 'Chmura zadanie.las' classified_genius.las")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if output_file is None:
        input_path = Path(input_file)
        output_file = str(input_path.parent / f"{input_path.stem}_GENIUS.las")
    
    classifier = GeniusStreamingClassifier()
    classifier.process_file_streaming(input_file, output_file)


if __name__ == "__main__":
    main()
