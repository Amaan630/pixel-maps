import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import debounce from 'lodash.debounce';
import { GeocodingResult, searchAddress } from '../services/geocoding';

interface Props {
  onSelectLocation: (result: GeocodingResult) => void;
  onClear?: () => void;
}

export function SearchBar({ onSelectLocation, onClear }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchAddress(text);
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
    debouncedSearch(text);
  };

  const handleSelect = (item: GeocodingResult) => {
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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Where to?"
          placeholderTextColor="#8a7a5a"
          value={query}
          onChangeText={handleChangeText}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {(query.length > 0 || hasSelection) && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {results.length > 0 && !hasSelection && (
        <FlatList
          style={styles.results}
          data={results}
          keyExtractor={(item) => item.place_id.toString()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.resultText} numberOfLines={2}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dec29b',
    borderWidth: 2,
    borderColor: '#40423d',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#40423d',
    fontFamily: 'ChineseRocks',
  },
  clearButton: {
    width: 36,
    height: 36,
    marginRight: 8,
    borderRadius: 18,
    backgroundColor: '#40423d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    color: '#dec29b',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    backgroundColor: '#dec29b',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#40423d',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
  },
  loadingText: {
    color: '#8a7a5a',
    fontStyle: 'italic',
  },
  results: {
    backgroundColor: '#dec29b',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#40423d',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
  },
  resultItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#c8b28d',
  },
  resultText: {
    color: '#40423d',
    fontSize: 14,
    lineHeight: 20,
  },
});
