import * as Haptics from 'expo-haptics';
import debounce from 'lodash.debounce';
import { ChevronLeftIcon, SearchIcon, XIcon } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { GeocodingResult, searchAddress } from '../services/geocoding';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

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
    setIsFocused(false);
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

  const handleBack = () => {
    Keyboard.dismiss();
    setIsFocused(false);
    setResults([]);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Don't automatically unfocus on blur - let explicit actions control focus state
    // (back button, selecting a result, tapping overlay)
  };

  const handleSubmit = () => {
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    <>
      {/* Background overlay when focused */}
      {isFocused && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.overlay, { backgroundColor: colors.textBackground }]}
        >
          <Pressable style={styles.overlayPressable} onPress={handleBack} />
        </Animated.View>
      )}

      <View style={[styles.container, isFocused && styles.containerFocused]}>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.textBackground, borderColor: colors.mutedBrown },
          ]}
        >
          {/* Back chevron when focused, magnifying glass when not */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={isFocused ? handleBack : () => inputRef.current?.focus()}
          >
            {isFocused ? (
              <ChevronLeftIcon width={22} height={22} strokeWidth={2.5} stroke={colors.textOnTextBackground} />
            ) : (
              <SearchIcon width={22} height={22} strokeWidth={2} stroke={colors.mutedBrown} />
            )}
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.textOnTextBackground, fontFamily: fonts.display }]}
            placeholder="Where to?"
            placeholderTextColor={colors.mutedBrown}
            value={query}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {(query.length > 0 || hasSelection) && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: colors.textOnTextBackground }]}
              onPress={handleClear}
            >
              <XIcon width={24} height={24} strokeWidth={2} stroke={colors.textBackground} />
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.mutedBrown }]}>Searching...</Text>
          </View>
        )}

        {results.length > 0 && !hasSelection && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <FlatList
              style={styles.results}
              data={results}
              keyExtractor={(item) => item.place_id.toString()}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.resultItem, { borderBottomColor: colors.mutedBrown }]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.resultText, { color: colors.textOnTextBackground }]} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    zIndex: 99,
  },
  overlayPressable: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  containerFocused: {
    // bottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 40,
  },
  iconButton: {
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    fontSize: 20,
    zIndex: 100,
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
    marginTop: 16,
    paddingHorizontal: 4,
  },
  loadingText: {
    fontStyle: 'italic',
    fontSize: 16,
  },
  results: {
    marginTop: 16,
    flex: 1,
  },
  resultItem: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 22,
  },
});
