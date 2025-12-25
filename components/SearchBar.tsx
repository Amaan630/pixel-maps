import debounce from 'lodash.debounce';
import * as Haptics from 'expo-haptics';
import { XIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { GeocodingResult, searchAddress } from '../services/geocoding';

interface Props {
  onSelectLocation: (result: GeocodingResult) => void;
  onClear?: () => void;
  userLocation?: { lat: number; lon: number } | null;
}

export function SearchBar({ onSelectLocation, onClear, userLocation }: Props) {
  const { theme } = useTheme();
  const { colors, fonts } = theme;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (text: string, location?: { lat: number; lon: number } | null) => {
      if (text.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchAddress(text, location ?? undefined);
        setResults(data);
      } catch (e) {
        console.error('Search error:', e);
        setResults([]);
      }
      setLoading(false);
    }, 500),
    []
  );

  const handleChangeText = (text: string) => {
    setQuery(text);
    setHasSelection(false);
    debouncedSearch(text, userLocation);
  };

  const handleSelect = (item: GeocodingResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    const shortName = item.display_name.split(',').slice(0, 2).join(',');
    setQuery(shortName);
    setResults([]);
    setHasSelection(true);
    onSelectLocation(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSelection(false);
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.textBackground, borderColor: colors.charcoal },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.charcoal, fontFamily: fonts.display }]}
          placeholder="Where to?"
          placeholderTextColor={colors.mutedBrown}
          value={query}
          onChangeText={handleChangeText}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {(query.length > 0 || hasSelection) && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: colors.charcoal }]}
            onPress={handleClear}
          >
            <XIcon width={24} height={24} strokeWidth={2} stroke={colors.parchment} />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: colors.textBackground, borderColor: colors.charcoal },
          ]}
        >
          <Text style={[styles.loadingText, { color: colors.mutedBrown }]}>Searching...</Text>
        </View>
      )}

      {results.length > 0 && !hasSelection && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <FlatList
            style={[
              styles.results,
              { backgroundColor: colors.textBackground, borderColor: colors.charcoal },
            ]}
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultItem, { borderBottomColor: colors.building }]}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.resultText, { color: colors.charcoal }]} numberOfLines={2}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 40,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 20,
  },
  clearButton: {
    width: 36,
    height: 36,
    marginRight: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    marginTop: -25,
    paddingTop: 25,
    zIndex: -1,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
  },
  loadingText: {
    fontStyle: 'italic',
  },
  results: {
    marginTop: -25,
    paddingTop: 25,
    zIndex: -1,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
  },
  resultItem: {
    padding: 14,
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
