package com.sih.deanonymizer.service.stylometry;

import com.sih.deanonymizer.dto.StylometricComparisonDto;
import com.sih.deanonymizer.dto.StylometricFeaturesDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class StylometryEngine {

    // Standard English function words list
    private static final Set<String> FUNCTION_WORDS = new HashSet<>(Arrays.asList(
            "the", "and", "of", "to", "in", "a", "is", "that", "for", "it", "as", "was", "with",
            "on", "by", "at", "from", "but", "not", "are", "this", "be", "or", "an", "have",
            "from", "which", "one", "you", "were", "her", "all", "she", "there", "would", "their",
            "we", "him", "been", "has", "when", "who", "will", "more", "no", "if", "out", "so",
            "said", "what", "up", "its", "about", "into", "than", "them", "can", "only", "other"
    ));

    // Regex pattern for Russian/Slavic smileys (e.g., ))), (((, !)))
    private static final Pattern SLAVIC_SMILEY_PATTERN = Pattern.compile("[)(]{2,}");
    private static final Pattern PUNCTUATION_PATTERN = Pattern.compile("[.,!?;:\"'()\\[\\]\\-{}]");

    /**
     * Extracts reproducible, statistical stylometric features from input text.
     */
    public StylometricFeaturesDto extractFeatures(String text) {
        StylometricFeaturesDto features = new StylometricFeaturesDto();
        if (text == null || text.trim().isEmpty()) {
            features.setTtr(0.0);
            features.setYulesK(0.0);
            features.setAvgSentenceLength(0.0);
            features.setAvgWordLength(0.0);
            features.setPunctuationFrequency(0.0);
            features.setFunctionWordRatio(0.0);
            features.setSmileyPatternFrequency(0.0);
            features.setTotalTokens(0);
            features.setUniqueTokens(0);
            features.setTotalSentences(0);
            return features;
        }

        String raw = text.trim();
        int totalChars = raw.length();

        // 1. Sentences
        String[] sentences = raw.split("[.!?]+");
        int sentenceCount = Math.max(1, sentences.length);
        features.setTotalSentences(sentenceCount);

        // 2. Tokenization (alphanumeric words)
        String[] words = raw.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", " ").split("\\s+");
        List<String> validTokens = new ArrayList<>();
        int totalWordCharLength = 0;
        int functionWordCount = 0;
        Map<String, Integer> wordFrequency = new HashMap<>();

        for (String w : words) {
            String token = w.trim();
            if (!token.isEmpty()) {
                validTokens.add(token);
                totalWordCharLength += token.length();
                wordFrequency.put(token, wordFrequency.getOrDefault(token, 0) + 1);
                if (FUNCTION_WORDS.contains(token)) {
                    functionWordCount++;
                }
            }
        }

        int totalTokens = validTokens.size();
        int uniqueTokens = wordFrequency.size();
        features.setTotalTokens(totalTokens);
        features.setUniqueTokens(uniqueTokens);

        if (totalTokens == 0) {
            features.setTtr(0.0);
            features.setYulesK(0.0);
            features.setAvgSentenceLength(0.0);
            features.setAvgWordLength(0.0);
            features.setPunctuationFrequency(0.0);
            features.setFunctionWordRatio(0.0);
            features.setSmileyPatternFrequency(0.0);
            return features;
        }

        // Type-Token Ratio (TTR)
        double ttr = (double) uniqueTokens / totalTokens;
        features.setTtr(round(ttr, 4));

        // Yule's K Characteristic
        // K = 10^4 * [ sum(i^2 * V_i) - N ] / N^2
        Map<Integer, Integer> frequencyOfFrequencies = new HashMap<>();
        for (int freq : wordFrequency.values()) {
            frequencyOfFrequencies.put(freq, frequencyOfFrequencies.getOrDefault(freq, 0) + 1);
        }

        double sumFreqSq = 0.0;
        for (Map.Entry<Integer, Integer> entry : frequencyOfFrequencies.entrySet()) {
            int freq = entry.getKey();
            int countOfWordsWithThisFreq = entry.getValue();
            sumFreqSq += Math.pow(freq, 2) * countOfWordsWithThisFreq;
        }

        double yulesK = totalTokens > 1 ?
                10000.0 * (sumFreqSq - totalTokens) / Math.pow(totalTokens, 2) : 0.0;
        features.setYulesK(round(Math.max(0.0, yulesK), 2));

        // Average sentence length (tokens / sentence)
        features.setAvgSentenceLength(round((double) totalTokens / sentenceCount, 2));

        // Average word length (chars / word)
        features.setAvgWordLength(round((double) totalWordCharLength / totalTokens, 2));

        // Punctuation frequency (count of punctuation marks / total chars)
        int punctCount = 0;
        Matcher punctMatcher = PUNCTUATION_PATTERN.matcher(raw);
        while (punctMatcher.find()) {
            punctCount++;
        }
        features.setPunctuationFrequency(round((double) punctCount / totalChars, 4));

        // Function word ratio
        features.setFunctionWordRatio(round((double) functionWordCount / totalTokens, 4));

        // Slavic smiley pattern count / sentence
        int smileyCount = 0;
        Matcher smileyMatcher = SLAVIC_SMILEY_PATTERN.matcher(raw);
        while (smileyMatcher.find()) {
            smileyCount++;
        }
        features.setSmileyPatternFrequency(round((double) smileyCount / sentenceCount, 4));

        return features;
    }

    /**
     * Extracts character 3-gram frequencies from text.
     */
    public Map<String, Integer> extractCharTrigrams(String text) {
        Map<String, Integer> trigrams = new HashMap<>();
        if (text == null) return trigrams;
        String clean = text.toLowerCase().replaceAll("\\s+", " ").trim();
        if (clean.length() < 3) return trigrams;

        for (int i = 0; i <= clean.length() - 3; i++) {
            String tri = clean.substring(i, i + 3);
            trigrams.put(tri, trigrams.getOrDefault(tri, 0) + 1);
        }
        return trigrams;
    }

    /**
     * Computes Cosine similarity between two character n-gram frequency maps.
     */
    public double computeCosineSimilarity(Map<String, Integer> vec1, Map<String, Integer> vec2) {
        if (vec1.isEmpty() || vec2.isEmpty()) return 0.0;

        Set<String> allKeys = new HashSet<>(vec1.keySet());
        allKeys.addAll(vec2.keySet());

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (String key : allKeys) {
            int valA = vec1.getOrDefault(key, 0);
            int valB = vec2.getOrDefault(key, 0);
            dotProduct += valA * valB;
            normA += Math.pow(valA, 2);
            normB += Math.pow(valB, 2);
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;
        return round(dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)), 4);
    }

    /**
     * Compares two text samples or combined text bodies and produces a deterministic comparison.
     */
    public StylometricComparisonDto compareTexts(String textA, String textB) {
        StylometricFeaturesDto fA = extractFeatures(textA);
        StylometricFeaturesDto fB = extractFeatures(textB);

        StylometricComparisonDto comparison = new StylometricComparisonDto();
        comparison.setSourceFeatures(fA);
        comparison.setTargetFeatures(fB);

        // 1. TTR similarity
        double ttrSim = 1.0 - Math.min(1.0, Math.abs(fA.getTtr() - fB.getTtr()) / Math.max(0.001, Math.max(fA.getTtr(), fB.getTtr())));
        comparison.setTtrSimilarity(round(Math.max(0.0, ttrSim), 4));

        // 2. Yule's K similarity
        double kDiff = Math.abs(fA.getYulesK() - fB.getYulesK());
        double maxK = Math.max(1.0, Math.max(fA.getYulesK(), fB.getYulesK()));
        double kSim = 1.0 - Math.min(1.0, kDiff / maxK);
        comparison.setYulesKSimilarity(round(Math.max(0.0, kSim), 4));

        // 3. Character 3-gram Cosine similarity
        Map<String, Integer> trigramsA = extractCharTrigrams(textA);
        Map<String, Integer> trigramsB = extractCharTrigrams(textB);
        double trigramSim = computeCosineSimilarity(trigramsA, trigramsB);
        comparison.setCharTrigramSimilarity(trigramSim);

        // 4. Punctuation frequency similarity
        double punctDiff = Math.abs(fA.getPunctuationFrequency() - fB.getPunctuationFrequency());
        double maxPunct = Math.max(0.001, Math.max(fA.getPunctuationFrequency(), fB.getPunctuationFrequency()));
        double punctSim = 1.0 - Math.min(1.0, punctDiff / maxPunct);
        comparison.setPunctuationSimilarity(round(Math.max(0.0, punctSim), 4));

        // 5. Sentence length similarity
        double slDiff = Math.abs(fA.getAvgSentenceLength() - fB.getAvgSentenceLength());
        double maxSl = Math.max(1.0, Math.max(fA.getAvgSentenceLength(), fB.getAvgSentenceLength()));
        double slSim = 1.0 - Math.min(1.0, slDiff / maxSl);
        comparison.setSentenceLengthSimilarity(round(Math.max(0.0, slSim), 4));

        // 6. Word length similarity
        double wlDiff = Math.abs(fA.getAvgWordLength() - fB.getAvgWordLength());
        double maxWl = Math.max(1.0, Math.max(fA.getAvgWordLength(), fB.getAvgWordLength()));
        double wlSim = 1.0 - Math.min(1.0, wlDiff / maxWl);
        comparison.setWordLengthSimilarity(round(Math.max(0.0, wlSim), 4));

        // 7. Function word ratio similarity
        double fwDiff = Math.abs(fA.getFunctionWordRatio() - fB.getFunctionWordRatio());
        double maxFw = Math.max(0.001, Math.max(fA.getFunctionWordRatio(), fB.getFunctionWordRatio()));
        double fwSim = 1.0 - Math.min(1.0, fwDiff / maxFw);
        comparison.setFunctionWordSimilarity(round(Math.max(0.0, fwSim), 4));

        // 8. Smiley / Slavic punctuation similarity
        double smileySim;
        if (fA.getSmileyPatternFrequency() == 0.0 && fB.getSmileyPatternFrequency() == 0.0) {
            smileySim = 1.0;
        } else if (fA.getSmileyPatternFrequency() > 0.0 && fB.getSmileyPatternFrequency() > 0.0) {
            double smDiff = Math.abs(fA.getSmileyPatternFrequency() - fB.getSmileyPatternFrequency());
            double maxSm = Math.max(fA.getSmileyPatternFrequency(), fB.getSmileyPatternFrequency());
            smileySim = 1.0 - Math.min(1.0, smDiff / maxSm);
        } else {
            smileySim = 0.0;
        }
        comparison.setSmileySimilarity(round(Math.max(0.0, smileySim), 4));

        // Composite Stylometry Score (0 - 100)
        // Weighted: Trigram (30%), TTR (20%), Yule's K (15%), Punctuation (15%), Sentence Length (10%), Smiley (10%)
        double compositeScore = (trigramSim * 0.30)
                + (ttrSim * 0.20)
                + (kSim * 0.15)
                + (punctSim * 0.15)
                + (slSim * 0.10)
                + (smileySim * 0.10);

        BigDecimal score = BigDecimal.valueOf(compositeScore * 100.0).setScale(2, RoundingMode.HALF_UP);
        comparison.setOverallStylometricScore(score);

        comparison.setAnalysisDetails(String.format(
                "Trigram Cosine: %.1f%%, TTR alignment: %.1f%%, Yule's K alignment: %.1f%%, Punctuation correlation: %.1f%%, Slavic smiley correlation: %.1f%%",
                trigramSim * 100.0, ttrSim * 100.0, kSim * 100.0, punctSim * 100.0, smileySim * 100.0
        ));

        return comparison;
    }

    private double round(double val, int decimals) {
        return BigDecimal.valueOf(val).setScale(decimals, RoundingMode.HALF_UP).doubleValue();
    }
}
