#!/bin/bash
# GENIUS STREAMING Classifier - szybki, skuteczny, oszczędny!

INPUT_FILE="${1:-Chmura zadanie.las}"
OUTPUT_FILE="${2:-classified_GENIUS.las}"

echo "🧠 GENIUS STREAMING Classifier"
echo "================================"
echo "Input:  $INPUT_FILE"
echo "Output: $OUTPUT_FILE"
echo ""

python3 classifier_genius.py "$INPUT_FILE" "$OUTPUT_FILE" 2>&1 | tee classification_genius.log

echo ""
echo "✅ Log zapisany: classification_genius.log"
